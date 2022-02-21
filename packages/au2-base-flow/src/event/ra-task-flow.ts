/* eslint-disable @typescript-eslint/restrict-template-expressions */

/** FROM https://raw.githubusercontent.com/aurelia/aurelia/master/packages/kernel/src/eventaggregator.ts */
/** ASYNC Version - FIFO (vs FILO for EventAggregator) */

import { Constructable, IDisposable } from '@aurelia/kernel';

/**
 * Represents a handler for an EventAggregator event.
 */
class RaHandler<T extends Constructable> {
  public constructor(public readonly messageType: T, public readonly callback: (message: InstanceType<T>) => Promise<void> | void, public readonly options: IRaSubscribeOptions) {}

  public handle(message: InstanceType<T>): Promise<void> | void {
    if (message instanceof this.messageType) {
      return this.callback.call(null, message);
    }
  }
}

export interface IRaSubscribeOptions {
  order?: number;
}

/**
 * Enables loosely coupled publish/subscribe messaging.
 * Awaiting version with FIFO (first in first out)
 */
export class RaTaskFlow {
  /** @internal */
  public readonly eventLookup: Record<string, { handle: (message: unknown, channel: string) => void; options: IRaSubscribeOptions }[]> = {};
  /** @internal */
  public readonly messageHandlers: RaHandler<Constructable>[] = [];

  /**
   * Publishes a message.
   *
   * @param channel - The channel to publish to.
   * @param message - The message to publish on the channel.
   */
  public publish<T, C extends string>(channel: C, message: T): void;
  /**
   * Publishes a message.
   *
   * @param instance - The instance to publish.
   */
  public async publish<T extends Constructable>(instance: InstanceType<T>): Promise<void>;
  public async publish<T extends Constructable | string>(channelOrInstance: T extends Constructable ? InstanceType<T> : T, message?: unknown): Promise<void> {
    if (!channelOrInstance) {
      throw new Error(`Invalid channel name or instance: ${channelOrInstance}.`);
    }

    if (typeof channelOrInstance === 'string') {
      let subscribers = this.eventLookup[channelOrInstance];
      if (subscribers !== void 0) {
        subscribers = subscribers.slice().sort((a, b) => {
          const vA = a.options?.order ?? 99999;
          const vB = b.options?.order ?? 99999;
          if (vA > vB) {
            return 1;
          } else if (vA < vB) {
            return -1;
          } else {
            return 0;
          }
        });

        for (let i = 0; i < subscribers.length; i++) {
          await Promise.resolve(subscribers[i].handle(message, channelOrInstance));
        }
      }
    } else {
      const subscribers = this.messageHandlers.slice();
      let i = subscribers.length;

      while (i-- > 0) {
        await Promise.resolve(subscribers[i].handle(channelOrInstance));
      }
    }
  }

  /**
   * Subscribes to a message channel (FIFO first in first out).
   *
   * @param channel - The event channel.
   * @param callback - The callback to be invoked when the specified message is published.
   */
  public subscribe<T, C extends string>(channel: C, callback: (message: T, channel: C) => Promise<void> | void, options?: IRaSubscribeOptions): IDisposable;
  /**
   * Subscribes to a message type (FIFO first in first out).
   *
   * @param type - The event message type.
   * @param callback - The callback to be invoked when the specified message is published.
   */
  public subscribe<T extends Constructable>(
    type: T,
    callback: (message: InstanceType<T>) => Promise<void> | void,
    options?: {
      order?: number;
    }
  ): IDisposable;
  public subscribe(channelOrType: string | Constructable, callback: (...args: unknown[]) => Promise<void> | void, options?: IRaSubscribeOptions): IDisposable {
    if (!channelOrType) {
      throw new Error(`Invalid channel name or type: ${channelOrType}.`);
    }

    let handler: RaHandler<any> | { handle: (...args: unknown[]) => Promise<void> | void; options: IRaSubscribeOptions };
    let subscribers: unknown[];

    if (typeof channelOrType === 'string') {
      if (this.eventLookup[channelOrType] === void 0) {
        this.eventLookup[channelOrType] = [];
      }
      handler = {
        handle: callback,
        options,
      };
      subscribers = this.eventLookup[channelOrType];
    } else {
      handler = new RaHandler(channelOrType, callback, options);

      subscribers = this.messageHandlers;
    }

    subscribers.push(handler);

    return {
      dispose(): void {
        const idx = subscribers.indexOf(handler);
        if (idx !== -1) {
          subscribers.splice(idx, 1);
        }
      },
    };
  }

  /**
   * Subscribes to a message channel, then disposes the subscription automatically after the first message is received.
   *
   * @param channel - The event channel.
   * @param callback - The callback to be invoked when the specified message is published.
   */
  public subscribeOnce<T, C extends string>(
    channel: C,
    callback: (message: T, channel: C) => Promise<void> | void,
    options?: {
      order?: number;
    }
  ): IDisposable;
  /**
   * Subscribes to a message type, then disposes the subscription automatically after the first message is received.
   *
   * @param type - The event message type.
   * @param callback - The callback to be invoked when the specified message is published.
   */
  public subscribeOnce<T extends Constructable>(
    type: T,
    callback: (message: InstanceType<T>) => Promise<void> | void,
    options?: {
      order?: number;
    }
  ): IDisposable;
  public subscribeOnce(
    channelOrType: string | Constructable,
    callback: (...args: unknown[]) => Promise<void> | void,
    options?: {
      order?: number;
    }
  ): IDisposable {
    const sub = this.subscribe(
      channelOrType as string,
      function (message, event) {
        sub.dispose();
        return callback(message, event);
      },
      options
    );

    return sub;
  }
}
