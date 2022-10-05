import { disposeAntiBounces, type IAntiBounce } from '@aegenet/belt-anti-bounce';
import { I18N } from '@aurelia/i18n';
import { IContainer, IEventAggregator, IPlatform, type TaskQueue } from 'aurelia';
import { IRouter, type RoutingInstruction, type Navigation, type Parameters } from '@aurelia/router';
import type { IBasePage } from './i-base-page';
import { DIAwareComponentService, type IAwareComponentService } from './aware/i-aware-component-service';

/**
 * Base Page
 */
export abstract class BasePage implements IBasePage {
  /**
   * Instances of anti-bounce
   * @remark Don't edit manually
   *
   * @private
   * @core
   */
  public $antiBounces?: Map<string, IAntiBounce>;

  /**
   * Event aggregator
   * @service
   * @core
   */
  protected readonly _ea: IEventAggregator;

  /**
   * Specify a special name for this instance
   *
   * "Je suis spécial !"
   */
  public eventName?: string;

  /**
   * Aware Service
   * @service
   * @core
   */
  protected readonly _aware: IAwareComponentService;

  /**
   * i18n
   * @service
   * @core
   */
  public readonly i18n: I18N;

  /** Router */
  protected readonly _router: IRouter;

  /**
   * Platform
   * @service
   * @core
   */
  protected readonly _platform: IPlatform;

  /**
   * Has been init ? (attached & _init())
   * @core
   */
  protected _isInit?: boolean;

  /**
   * Last error message
   * @core
   */
  public lastError?: string;

  constructor(protected readonly _container: IContainer) {
    this._ea = this._container.get(IEventAggregator);
    this._platform = this._container.get(IPlatform);
    this._aware = this._container.get(DIAwareComponentService);
    if (this._container.has(I18N, true)) {
      this.i18n = this._container.get(I18N);
    } else {
      console.debug('I18N cannot be used without the right configuration.');
    }
    if (this._container.has(IRouter, true)) {
      this._router = this._container.get(IRouter);
    } else {
      console.debug('Router cannot be used without the right configuration.');
    }
  }

  public async load?(parameters: Parameters, instruction: RoutingInstruction, navigation: Navigation): Promise<void> {
    this._aware.subscribe(this);
    await Promise.resolve(this._init(parameters, instruction, navigation));
    this._isInit = true;
  }

  /**
   * Custom logic (on load)
   */
  protected _init(parameters: Parameters, instruction: RoutingInstruction, navigation: Navigation): void | Promise<void> {
    //
  }

  /** Custom logic (on unload) */
  protected _deinit(instruction: RoutingInstruction, navigation: Navigation | null): void | Promise<void> {
    //
  }

  /** Unload the page */
  public async unload(instruction: RoutingInstruction, navigation: Navigation | null): Promise<void> {
    disposeAntiBounces(this);
    this._aware.unsubscribe(this);
    await Promise.resolve(this._deinit(instruction, navigation));
    this._isInit = false;
  }

  /**
   * TaskQueue
   * @remark Can be used to rugged SSR
   * @core
   */
  public get taskQueue(): TaskQueue {
    return this._platform.taskQueue;
  }

  /**
   * Event aggregator
   * @service
   * @core
   */
  public get ea(): IEventAggregator {
    return this._ea;
  }
}
