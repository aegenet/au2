import type { IContainer, IResolver } from '@aurelia/kernel';

/**
 * @internal
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
  container: IContainer & {
    h?: Map<any, IResolver & { resolving?: boolean; _state?: unknown; C?: number }>;
    u?: Map<any, any>;
  }
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

  for (const [key, value] of container.h?.entries() || []) {
    if (value.C != null) {
      // "C" is the type of the resolver
      stats[ResolverStrategyMap[value.C]].push({
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
