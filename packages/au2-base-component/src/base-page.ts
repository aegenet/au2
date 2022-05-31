import { disposeAntiBounces, type IAntiBounce, type IAntiBounceSupport } from '@aegenet/belt-anti-bounce';
import { I18N } from '@aurelia/i18n';
import { IContainer, IEventAggregator, IPlatform, IRouter, type IRouteViewModel, type TaskQueue, type Params, type RouteNode } from 'aurelia';

/**
 * Base Page
 */
export abstract class BasePage implements IRouteViewModel, IAntiBounceSupport {
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
   * i18n
   * @service
   * @core
   */
  public readonly i18n: I18N;

  /** Router */
  private readonly _router: IRouter;

  /**
   * Platform
   * @service
   * @core
   */
  private readonly _platform: IPlatform;

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

  public async load(params: Params, next: RouteNode, current: RouteNode | null): Promise<void> {
    await Promise.resolve(this._init(params, next, current));
    this._isInit = true;
  }

  /**
   * Custom logic (on load)
   */
  protected _init(params: Params, next: RouteNode, current: RouteNode | null): void | Promise<void> {
    //
  }

  /** Custom logic (on unload) */
  protected _deinit(next: RouteNode | null, current: RouteNode): void | Promise<void> {
    //
  }

  /** Unload the page */
  public async unload(next: RouteNode | null, current: RouteNode): Promise<void> {
    disposeAntiBounces(this);
    await Promise.resolve(this._deinit(next, current));
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
}
