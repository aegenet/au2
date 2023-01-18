import type { IAntiBounce, IAntiBounceSupport } from '@aegenet/belt-anti-bounce';
import type { I18N } from '@aurelia/i18n';
import type { IDisposable, IEventAggregator, TaskQueue } from 'aurelia';
import type { IRouteableComponent, RoutingInstruction, Navigation, Parameters } from '@aurelia/router';
import type { ICustomElementAware } from './aware/i-custom-element-aware';

/**
 * Base Page
 */
export interface IBasePage extends IRouteableComponent, IAntiBounceSupport, ICustomElementAware {
  /** Token of Aware Component */
  $awareToken?: IDisposable;

  /**
   * Instances of anti-bounce
   * @remark Don't edit manually
   *
   * @private
   * @core
   */
  $antiBounces?: Map<string, IAntiBounce>;

  /**
   * i18n
   * @service
   * @core
   */
  readonly i18n: I18N;

  /**
   * Last error message
   * @core
   */
  lastError?: string;

  loading?(parameters: Parameters, instruction: RoutingInstruction, navigation: Navigation): Promise<void>;

  /** Unload the page */
  unloading(instruction: RoutingInstruction, navigation: Navigation | null): Promise<void>;

  /**
   * TaskQueue
   * @remark Can be used to rugged SSR
   * @core
   */
  get taskQueue(): TaskQueue;

  /**
   * Event aggregator
   * @service
   * @core
   */
  get ea(): IEventAggregator;
}
