import { IEventAggregator, IPlatform, type TaskQueue, IAuSlotsInfo, bindable, type IContainer } from 'aurelia';
import { I18N } from '@aurelia/i18n';
import { disposeAntiBounces, type IAntiBounce } from '@aegenet/belt-anti-bounce';
import type { IBaseComponent } from './i-base-component';
import { DIAwareComponentService, type IAwareComponentService } from './aware/i-aware-component-service';
import type { IHydratedController } from '@aurelia/runtime-html';
import { DIStoreService, type IStoreService } from './store/i-store-service';

/**
 * Base component, with basic logic
 */
export class BaseComponent<EBD = unknown> implements IBaseComponent {
  private static _COUNTER: number = 1;
  /**
   * Instances of anti-bounce
   * @remark Don't edit manually
   *
   * @private
   * @core
   */
  public $antiBounces?: Map<string, IAntiBounce>;

  /**
   * AU Slot informations
   * @core
   */
  private readonly _auSlotInfo: IAuSlotsInfo;

  /**
   * Event aggregator
   * @service
   * @core
   */
  protected readonly _ea: IEventAggregator;

  /**
   * Aware Service
   * @service
   * @core
   */
  protected readonly _aware: IAwareComponentService;

  /**
   * Platform
   * @service
   * @core
   */
  protected readonly _platform: IPlatform;

  /**
   * StoreService
   * @service
   * @core
   */
  protected readonly _store: IStoreService;

  /**
   * i18n
   * @service
   * @core
   */
  public readonly i18n!: I18N;

  /**
   * Component ID
   * @core
   */
  public readonly uid?: string;

  /**
   * Specify a special name for this instance
   *
   * "Je suis spécial !"
   */
  @bindable()
  public eventName?: string;

  /**
   * Has been init? (attached & _init())
   * @core
   */
  protected _isInit?: boolean;

  /**
   * Have u met T... Slots? (slot)
   * @remark We fill this object with slot only (not au-slot)
   * @core
   */
  public slots: Record<string, Element> = {};

  /**
   * Have u met T... AuSlots? (au-slot)
   * @remark We fill this object with au-slot only (just the name)
   * @core
   */
  public auSlots: Record<string, boolean> = {};

  /**
   * Array of au-slot names
   * @core
   */
  public auSlotNames?: string[];

  /**
   * Array of slot names
   * @core
   */
  public slotNames: string[] = [];

  /**
   * Last error message
   * @core
   */
  public lastError?: string;

  /**
   * Is busy ?
   * @core
   */
  public isBusy?: boolean;

  /** Embed data */
  @bindable()
  public embedData?: EBD;

  /**
   * This predicate is called when the value of the bindable (value) property changes.
   *
   * @type callback
   * @input newValue
   * @input oldValue
   * @input embedData
   */
  @bindable()
  public changed?: (...args: unknown[]) => void;

  constructor(
    protected _element: Element,
    protected _container: IContainer
  ) {
    this.uid = `au2-comp-${BaseComponent._COUNTER++}`;
    this._auSlotInfo = this._container.get(IAuSlotsInfo);
    this._ea = this._container.get(IEventAggregator);
    this._aware = this._container.get(DIAwareComponentService);
    this._platform = this._container.get(IPlatform);
    this._store = this._container.get(DIStoreService);
    if (this._container.has(I18N, true)) {
      this.i18n = this._container.get(I18N);
    } else {
      console.debug('I18N cannot be used without right configuration.');
    }
  }

  /**
   * On attached we refresh slots and au-slots objects, subscribe to aware service,
   * then we call the protected `_init()` method
   */
  public async attached(): Promise<void> {
    try {
      // Retrieve the slots and au-slots
      this._refreshSlots();

      this.isBusy = true;
      this._aware.subscribe(this);
      await Promise.resolve(this._init());
      this._isInit = true;
    } finally {
      this.isBusy = false;
    }
  }

  /**
   * Detaching
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public detaching(initiator: IHydratedController, parent: IHydratedController) {
    this._aware.unsubscribe(this);
  }

  /**
   * Custom logic (after attached)
   */
  protected _init(): void | Promise<void> {
    //
  }

  /** Custom logic (after detaching and unbinding, before dispose) */
  protected _deinit(): void | Promise<void> {
    //
  }

  /**
   * Refresh slots and au-slots
   */
  private _refreshSlots() {
    this.auSlotNames = this._auSlotInfo.projectedSlots as string[];
    this.auSlots = {};
    this.slots = {};
    if (this.auSlotNames.length) {
      this.auSlotNames.forEach(auSlotName => {
        this.auSlots[auSlotName] = true;
      });
    }

    if (this._element) {
      const slots = this._element.children ? Array.from(this._element.children) : [];
      const slotNames = [];
      let sloti: Element & {
        slot?: string;
      };
      for (let i = 0; i < slots.length; i++) {
        if ((sloti = slots[i]) && sloti.slot) {
          this.slots[sloti.slot!] = sloti;
          slotNames.push(sloti.slot!);
        }
      }
      this.slotNames = slotNames;
    }
  }

  /**
   * Unbinding
   */
  public async unbinding(): Promise<void> {
    this.slots = {};
    this.slotNames = [];
    this.auSlots = {};
    this.auSlotNames = [];
    disposeAntiBounces(this);
    this._isInit = false;
    await Promise.resolve(this._deinit());
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
