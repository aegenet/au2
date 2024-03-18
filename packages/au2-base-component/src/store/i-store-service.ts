import { DI, type IContainer } from 'aurelia';
import type { IStoreMessenger } from './i-store-messenger';

export const DIStoreService = DI.createInterface<IStoreService>('au2.store-service');

export type StoreKey = string | symbol;

export type StoreLoadOptions = {
  key: string;
  data?: unknown;
  load?: (container: IContainer) => Promise<unknown>;
};

/**
 * StoreService
 */
export interface IStoreService {
  /** Initialize */
  initialize(options?: {
    /** Own event aggregator implementation */
    eventAggregator?: IStoreMessenger;
    /** @default 'au2.store-service' */
    channel?: string;
  }): void;

  /** Dispose */
  dispose(): void;

  /** Set data/load on Store */
  setStore(...options: StoreLoadOptions[]): void;

  /** Delete data/load from Store */
  delStore(key: StoreKey): void;

  /** Get data from Store */
  getStore<T = unknown>(key: StoreKey): Promise<T>;

  /** Refresh data from Store */
  refreshStore(key: StoreKey): Promise<void>;
}
