import { IDisposable, kebabCase, isNullOrUndefined, IContainer, InterfaceSymbol } from '@aurelia/kernel';
import { IRaTaskFlow } from './i-ra-task-flow';

/**
 * Permet de "get" les instances demandées, l'ordre est respecté
 * @param container
 * @param keys
 * @returns
 */
export function plug(container: IContainer, ...keys: InterfaceSymbol[]) {
  const pluggedDI: InstanceType<any>[] = [];
  for (const key of keys) {
    pluggedDI.push(container.get(key));
  }
  return pluggedDI;
}

/**
 * Permet de plug automatiquement les Services ayant le décorateur `raTFSubscription`
 * @param container
 * @returns
 */
export function autoPlug(container: IContainer) {
  return plug(container, ...raTFSubscribers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(f => f.key));
}

/**
 * Permet d'ajouter automatiquement un evenement lié à cette méthode.
 * Attention, passe obligatoirement par un RaEventAggregator
 *
 * @example
 * @raRegisterTF()
 * public doIt() {
 *  alert('hello');
 * }
 *
 * // ea.publish(ra.[nom de la classe]:do-it)
 */
export function raRegisterTF(
  options: {
    /** Channel */
    channel?: string;
    /** Une seule fois */
    once?: boolean;
    /** prefix du message (`ra.` par défaut) */
    prefix?: string;
    /** Optionnel, permet de définir un ordre de passage */
    order?: number;
  } = { once: false }
) {
  return function (target: RaTaskFlowSubscription, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    if (!(target as any).__raFT) {
      (target as any).__raFT = [];
    }

    const actions: IRaTask[] = (target as any).__raFT;

    const channel = `${options.prefix ?? 'ra.'}${options.channel || `${kebabCase(target.constructor.name)}:${kebabCase(propertyKey.toString())}`}`;
    // if (!channel) {
    //   channel = `${options.prefix ?? 'ra.'}${kebabCase(target.constructor.name)}:${kebabCase(propertyKey.toString())}`;
    // }
    if (actions) {
      actions.push({
        channel,
        once: !!options.once,
        methodName: propertyKey.toString(),
        token: undefined,
        order: options.order,
      });
    }
    return descriptor;
  };
}

export interface IRaTask {
  channel: string;
  once: boolean;
  methodName: string;
  token?: IDisposable;
  order?: number;
}

export const raTFSubscribers: { key: InterfaceSymbol; order?: number }[] = [];

export function raTFSubscription(key: InterfaceSymbol, order?: number) {
  return function (target: () => void) {
    raTFSubscribers.push({
      key,
      order,
    });
  };
}

/**
 * Permet de gérer des subscriptions vers des méthodes
 * A utiliser avec @raRegisterTF()
 */
export abstract class RaTaskFlowSubscription implements IDisposable {
  private __raFT?: IRaTask[];

  constructor(protected _taskFlow: IRaTaskFlow) {
    this.__subscribe(this.__getAllRaFT());
  }

  /** Dispose */
  public dispose() {
    this.__dispose(this.__getAllRaFT());
  }

  private __getAllRaFT(): IRaTask[] {
    const allRaFT: IRaTask[] = [];
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let context = this;
    do {
      if (context.__raFT) {
        allRaFT.push(...context.__raFT);
      }
      context = (context as any).__proto__;
    } while (context?.constructor.name !== 'Object');

    return allRaFT;
  }

  private __subscribe(raFT: IRaTask[]) {
    raFT.forEach(f => {
      if (f.token) {
        f.token.dispose();
        f.token = undefined;
      }
      if (f.once) {
        f.token = this._taskFlow.subscribeOnce(
          f.channel,
          async (args: unknown[]) => {
            await this.__callMethod(f, args);
          },
          {
            order: f.order,
          }
        );
      } else {
        f.token = this._taskFlow.subscribe(
          f.channel,
          async (args: unknown[]) => {
            await this.__callMethod(f, args);
          },
          {
            order: f.order,
          }
        );
      }
    });
  }

  private async __callMethod(f: IRaTask, args: unknown[]) {
    if (isNullOrUndefined(args)) {
      await Promise.resolve((this as any)[f.methodName]());
    } else if (args instanceof Array) {
      await Promise.resolve((this as any)[f.methodName](...args));
    } else if (args) {
      await Promise.resolve((this as any)[f.methodName](...Object.values(args)));
    } else {
      throw new Error('Implementation error: you must pass an array of arguments.');
    }
  }

  private __dispose(raFT: IRaTask[]) {
    raFT.forEach(f => {
      if (f.token) {
        f.token.dispose();
        f.token = undefined;
      }
    });
  }
}
