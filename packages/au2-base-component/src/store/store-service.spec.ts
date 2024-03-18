import * as assert from 'node:assert';
import { StoreService } from './store-service';
import { DIStoreService, type IStoreService } from './i-store-service';
import { IContainer, DI, Registration, IEventAggregator, type IDisposable } from 'aurelia';
import { arrayToObject } from '@aegenet/belt-array-to-obj';
import type { IStoreMessenger } from './i-store-messenger';

describe('store-service', () => {
  let container: IContainer | undefined = undefined;
  let storeService: IStoreService | undefined = undefined;

  beforeAll(() => {
    container = DI.createContainer();
    container.register(Registration.singleton(DIStoreService, StoreService));
    storeService = container.get<IStoreService>(DIStoreService);
  });
  afterAll(() => {
    storeService.dispose();
    container.dispose();
  });

  afterEach(() => {
    localStorage.setItem('user', JSON.stringify([]));
    storeService.delStore('user');
  });

  it('get & init storeService', async () => {
    assert.ok(storeService);
    assert.ok(storeService instanceof StoreService);
    storeService.initialize();
  });

  it('re-init storeService', async () => {
    storeService.initialize();
  });

  it('Setup & get & refresh', async () => {
    assert.rejects(async () => await storeService.getStore('user'), { message: 'Unknown store was provided: user' });

    // Setup
    storeService.setStore(
      {
        key: 'user',
        async load(container) {
          return JSON.parse(localStorage.getItem('user') || '[]');
        },
      },
      {
        key: 'user_index',
        async load(container) {
          return arrayToObject((await storeService.getStore('user')) as unknown[], 'id');
        },
      }
    );

    // Get
    assert.deepStrictEqual(await storeService.getStore('user'), []);

    // Refresh
    localStorage.setItem('user', JSON.stringify([{ id: 1, name: 'John' }]));
    await storeService.refreshStore('user');

    // Get
    assert.deepStrictEqual(await storeService.getStore('user'), [{ id: 1, name: 'John' }]);
  });

  it('Delete store', async () => {
    assert.rejects(async () => await storeService.getStore('user'), { message: 'Unknown store was provided: user' });
    // Do nothing
    await storeService.delStore('user');
    assert.rejects(async () => await storeService.getStore('user'), { message: 'Unknown store was provided: user' });

    // Setup
    storeService.setStore(
      {
        key: 'user',
        async load(container) {
          return JSON.parse(localStorage.getItem('user') || '[]');
        },
      },
      {
        key: 'user_index',
        async load(container) {
          return arrayToObject((await storeService.getStore('user')) as unknown[], 'id');
        },
      }
    );

    // Get
    assert.deepStrictEqual(await storeService.getStore('user'), []);

    // Delete
    await storeService.delStore('user');
    assert.rejects(async () => await storeService.getStore('user'), { message: 'Unknown store was provided: user' });
  });

  it('Refresh unknown store', async () => {
    assert.rejects(async () => await storeService.refreshStore('user'), { message: 'Unknown store was provided: user' });
  });

  it('Custom Event aggegator & Setup & get & refresh', async () => {
    const storeWCustomEv = new StoreService(container);
    const commonEv = container.get(IEventAggregator);
    storeWCustomEv.initialize({
      eventAggregator: commonEv,
      channel: 'custom-store',
    });
    assert.rejects(async () => await storeWCustomEv.getStore('user'), { message: 'Unknown store was provided: user' });

    // Setup
    storeWCustomEv.setStore(
      {
        key: 'user',
        async load(container) {
          return JSON.parse(localStorage.getItem('user') || '[]');
        },
      },
      {
        key: 'user_index',
        async load(container) {
          return arrayToObject((await storeWCustomEv.getStore('user')) as unknown[], 'id');
        },
      }
    );

    // Get
    assert.deepStrictEqual(await storeWCustomEv.getStore('user'), []);

    // Refresh
    localStorage.setItem('user', JSON.stringify([{ id: 1, name: 'John' }]));
    await commonEv.publish('custom-store:refresh', { key: 'user' });

    // Get
    assert.deepStrictEqual(await storeWCustomEv.getStore('user'), [{ id: 1, name: 'John' }]);

    // Delete
    await commonEv.publish('custom-store:del', { key: 'user' });

    assert.rejects(async () => await storeWCustomEv.getStore('user'), { message: 'Unknown store was provided: user' });
  });

  it('Own Event aggegator with async publish', async () => {
    const storeWCustomEv = new StoreService(container);
    class CustomEventAggregator implements IStoreMessenger {
      private _map = new Map<string, ((message: unknown, channel: string) => void)[]>();
      constructor() {}
      subscribe<T, C extends string>(channel: C, callback: (message: T, channel: C) => void): IDisposable {
        const curCallbacks = this._map.get(channel) || [];
        curCallbacks.push(callback as unknown as (message: unknown, channel: string) => void);
        this._map.set(channel, curCallbacks);
        return {
          dispose() {
            const idx = curCallbacks.indexOf(callback as unknown as (message: unknown, channel: string) => void);
            if (idx !== -1) {
              curCallbacks.splice(idx, 1);
            }
            this._map.set(channel, curCallbacks);
          },
        };
      }
      async publish<T, C extends string>(channel: C, message: T): Promise<void> {
        const cbs = this._map.get(channel) || [];
        for (const cb of cbs) {
          await cb(message, channel);
        }
      }
      /** Get single subscriber result for the channel */
      async getSingle<T, C extends string, O = unknown>(channel: C, message: T): Promise<O> {
        const cbs = this._map.get(channel);
        if (cbs?.length) {
          if (cbs.length === 1) {
            return (await cbs[0](message, channel)) as O;
          } else {
            throw new Error(`Multiple subscribers were found for the channel ${channel}`);
          }
        }
      }
      /** Get all subscribers results for the channel */
      async getAll<T, C extends string, O = unknown>(channel: C, message: T): Promise<O[]> {
        const cbs = this._map.get(channel) || [];
        const results: unknown[] = [];
        for (const cb of cbs) {
          results.push(await cb(message, channel));
        }
        return results as O[];
      }
    }
    const customEv = new CustomEventAggregator();
    storeWCustomEv.initialize({
      eventAggregator: customEv,
      channel: 'custom-store',
    });
    assert.rejects(async () => await customEv.getSingle('custom-store:get', { key: 'user' }), { message: 'Unknown store was provided: user' });

    // Setup
    storeWCustomEv.setStore(
      {
        key: 'user',
        async load(container) {
          return JSON.parse(localStorage.getItem('user') || '[]');
        },
      },
      {
        key: 'user_index',
        async load(container) {
          return arrayToObject((await storeWCustomEv.getStore('user')) as unknown[], 'id');
        },
      }
    );

    // Get
    assert.deepStrictEqual(await customEv.getSingle('custom-store:get', { key: 'user' }), []);

    // Refresh
    localStorage.setItem('user', JSON.stringify([{ id: 1, name: 'John' }]));
    await customEv.publish('custom-store:refresh', { key: 'user' });

    // Get
    assert.deepStrictEqual(await customEv.getSingle('custom-store:get', { key: 'user' }), [{ id: 1, name: 'John' }]);

    // Delete
    await customEv.publish('custom-store:del', { key: 'user' });

    assert.rejects(async () => await customEv.getSingle('custom-store:get', { key: 'user' }), { message: 'Unknown store was provided: user' });
  });
});
