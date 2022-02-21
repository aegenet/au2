import type { IContainer } from '@aurelia/kernel';
import { raPlatform } from '../ra-platform';

/** @internal */
export const ResolverStrategyMap = {
  0: 'instance',
  1: 'singleton',
  2: 'transient',
  3: 'callback',
  4: 'array',
  5: 'alias',
};

export function debugContainer(container: IContainer, mode: 'entries' | 'state' | 'not-loaded') {
  const platform = raPlatform();

  switch (mode) {
    case 'entries':
      platform.console.log(
        Array.from((container as any).u.entries()).map((f, i) => {
          return { [`${i}_${f[0].friendlyName}`]: f[1].state };
        })
      );
      break;
    case 'state':
      platform.console.log(
        Array.from((container as any).u.entries()).map((f, i) => {
          return { [`${i}_${f[0].friendlyName}`]: `${f[1].resolving} >-< ${ResolverStrategyMap[f[1].strategy]}` };
        })
      );
      break;
    case 'not-loaded':
      platform.console.log(
        Array.from((container as any).u.entries())
          .filter(f => f[1].strategy !== 0)
          .map((f, i) => {
            return { [`${i}_${f[0].friendlyName}`]: `${f[1].resolving} >-< ${ResolverStrategyMap[f[1].strategy]}` };
          })
      );
      break;
  }
}
