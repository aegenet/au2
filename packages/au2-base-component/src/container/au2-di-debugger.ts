import type { IContainer, IResolver } from '@aurelia/kernel';

/**
 * Internal usage
 * https://github.com/aurelia/aurelia/blob/master/packages/kernel/src/di.ts#L777
 */
export enum ResolverStrategyMap {
  instance = 0,
  singleton = 1,
  transient = 2,
  callback = 3,
  array = 4,
  alias = 5,
}

export type DebugContainerStats = {
  [K in keyof typeof ResolverStrategyMap]: Record<
    string,
    {
      resolving: boolean;
      current: unknown | null;
    }
  >[];
};

/**
 * Get the container informations
 */
export function debugContainer(
  container:
    | (IContainer & {
        h?: Map<any, IResolver & { resolving?: boolean; _state?: unknown; C?: number }>;
        u?: Map<any, any>;
      })
    | undefined
    | null
): DebugContainerStats {
  const stats: DebugContainerStats = {
    instance: [],
    singleton: [],
    transient: [],
    callback: [],
    array: [],
    alias: [],
  };

  if (container == null) {
    return stats;
  }

  const resolverStratField = __DEV__ ? '_strategy' : '$';
  const resolverField = __DEV__ ? '_resolvers' : 'h';
  type ValueViteDevProd = {
    /** Dev */
    _strategy?: number;
    /** Webpack kind */
    C?: number;
    /** Vite kind */
    $?: number;
  };

  for (const [key, value] of (
    container as unknown as Record<string, Map<string, { resolving: boolean; _state: unknown }>>
  )[resolverField]?.entries() || []) {
    if ((value as ValueViteDevProd)[resolverStratField] != null) {
      // "C" is the type of the resolver
      stats[
        (ResolverStrategyMap as Record<number, keyof typeof ResolverStrategyMap>)[
          (value as ValueViteDevProd)[resolverStratField]!
        ]
      ].push({
        [_getKeyName(key) || 'unknown']: {
          resolving: value.resolving ?? false,
          current: value._state, // value.C === 0 ?? true ? container.get(key) : null,
        },
      });
    }
  }

  return stats;
}

function _getKeyName(key: any): string {
  return typeof key === 'string' ? key : key.friendlyName || key.toString();
}
