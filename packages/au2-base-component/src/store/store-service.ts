import { inject, IContainer, type IDisposable } from 'aurelia';
import type { IStoreService, StoreKey, StoreLoadOptions } from './i-store-service';
import type { IStoreMessenger } from './i-store-messenger';

/**
 * StoreService
 */
@inject(IContainer)
export class StoreService implements IStoreService {
  private _isInit: boolean = false;
  private readonly _store: Map<StoreKey, StoreLoadOptions> = new Map();
  private _tokens: IDisposable[] = [];
  private _channel: string = 'au2.store-service';
  private _ev?: IStoreMessenger;

  constructor(private readonly _container: IContainer) {
    //
  }

  /** Initialize */
  public initialize(
    options: {
      /** event aggregator implementation */
      eventAggregator?: IStoreMessenger;
      /** @default 'au2.store-service' */
      channel?: string;
    } = {}
  ): void {
    if (this._isInit) {
      return;
    }
    if (options.channel) {
      this._channel = options.channel;
    }
    if (options.eventAggregator) {
      this._ev = options.eventAggregator;
    }

    if (this._ev) {
      this._tokens.push(
        this._ev.subscribe(`${this._channel}:set`, async (options: StoreLoadOptions) => {
          await this.setStore(options);
        }),
        this._ev.subscribe(`${this._channel}:get`, async (options: StoreLoadOptions) => {
          return this.getStore(options.key);
        }),
        this._ev.subscribe(`${this._channel}:del`, async (options: StoreLoadOptions) => {
          await this.delStore(options.key);
        }),
        this._ev.subscribe(`${this._channel}:refresh`, async (options: StoreLoadOptions) => {
          await this.refreshStore(options.key);
        })
      );
    }

    this._isInit = true;
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
      this._ev?.publish(`${this._channel}:loaded`, {
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
      this._ev?.publish(`${this._channel}:loaded`, {
        key,
        data: store.data,
      });
    }
  }
}
