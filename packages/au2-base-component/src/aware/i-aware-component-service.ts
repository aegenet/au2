import { type Controller, DI } from 'aurelia';
import type { IAwareEvent } from './i-aware-event';
import type { ICustomElementAware } from './i-custom-element-aware';

export const DIAwareComponentService = DI.createInterface<IAwareComponentService>('au2.aware-component-service');

export interface IAwareComponentService {
  /** Subscribe */
  subscribe(customElement: ICustomElementAware & { $controller?: Controller }): void;

  /** Publish */
  publish(customElement: ICustomElementAware, options: IAwareEvent): void;

  /** Unsuscribe */
  unsubscribe(customElement: ICustomElementAware): void;
}
