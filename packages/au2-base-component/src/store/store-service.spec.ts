import * as assert from 'node:assert';
import { StoreService } from './store-service';
import { DIStoreService, type IStoreService } from './i-store-service';
import { IContainer, DI, Registration, EventAggregator, IEventAggregator } from 'aurelia';
import { arrayToObject } from '@aegenet/belt-array-to-obj';

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
    const storeWCustomEv = new StoreService(container, new EventAggregator());
    const commonEv = container.get(IEventAggregator);
    storeWCustomEv.initialize({
      ownEventAggregator: commonEv,
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
});
