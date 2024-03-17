import type { IDisposable } from 'aurelia';

/** Common messenger interface */
export interface IStoreMessenger {
  /**
   * Subscribes to a message channel.
   *
   * @param channel - The event channel.
   * @param callback - The callback to be invoked when the specified message is published.
   */
  subscribe<T, C extends string>(channel: C, callback: (message: T, channel: C) => void): IDisposable;

  /**
   * Publishes a message.
   *
   * @param channel - The channel to publish to.
   * @param message - The message to publish on the channel.
   */
  publish<T, C extends string>(channel: C, message: T): unknown;
}
