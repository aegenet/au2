import { IEventAggregator, inject, IContainer, IDisposable } from 'aurelia';
import type { IStoreService, StoreKey, StoreLoadOptions } from './i-store-service';

/**
 * StoreService
 */
@inject(IContainer, IEventAggregator)
export class StoreService implements IStoreService {
  private _isInit: boolean = false;
  private readonly _store: Map<StoreKey, StoreLoadOptions> = new Map();
  private _tokens: IDisposable[] = [];

  constructor(private readonly _container: IContainer, private readonly _ev: IEventAggregator) {
    //
  }

  /** Initialize */
  public initialize(): void {
    if (this._isInit) {
      return;
    }
    this._isInit = true;
    this._tokens.push(
      this._ev.subscribe('au2.store-service:set', async (options: StoreLoadOptions) => {
        await this.setStore(options);
      }),
      this._ev.subscribe('au2.store-service:del', async (options: StoreLoadOptions) => {
        await this.delStore(options.key);
      }),
      this._ev.subscribe('au2.store-service:refresh', async (options: StoreLoadOptions) => {
        await this.refreshStore(options.key);
      })
    );
  }

  /** Dispose */
  public dispose(): void {
    this._tokens?.forEach(f => f.dispose());
    this._tokens = [];
    this._isInit = false;
    this._store.clear();
  }

  /** Set data/load on Store */
  public setStore(...options: StoreLoadOptions[]): void {
    options?.forEach(f => {
      this._store.set(f.key, f);
    });
  }

  /** Delete data/load from Store */
  public delStore(key: StoreKey): void {
    this._store.delete(key);
  }

  /** Get data from Store */
  public async getStore<T = unknown>(key: StoreKey): Promise<T> {
    const store = this._store.get(key);
    if (!store) {
      throw new Error(`Unknown store was provided: ${String(key)}`);
    }
    if (!store.data && store.load) {
      store.data = await store.load(this._container);
      this._ev.publish('au2.store-service:loaded', {
        key,
        data: store.data,
      });
    }
    return store.data as T;
  }

  /** Refresh data from Store */
  public async refreshStore(key: StoreKey): Promise<void> {
    const store = this._store.get(key);
    if (!store) {
      throw new Error(`Unknown store was provided: ${String(key)}`);
    }
    if (store.load) {
      store.data = await store.load(this._container);
      this._ev.publish('au2.store-service:loaded', {
        key,
        data: store.data,
      });
    }
  }
}
