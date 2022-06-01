import { IContainer } from '@aurelia/kernel';
import { type ICustomElementViewModel, IEventAggregator, IPlatform, type TaskQueue, IAuSlotsInfo, bindable } from 'aurelia';
import { I18N } from '@aurelia/i18n';
import { disposeAntiBounces, type IAntiBounce, type IAntiBounceSupport } from '@aegenet/belt-anti-bounce';

/**
 * Base component, with basic logic
 */
export class BaseComponent<EBD = unknown> implements ICustomElementViewModel, IAntiBounceSupport {
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
   * Platform
   * @service
   * @core
   */
  private readonly _platform: IPlatform;

  /**
   * i18n
   * @service
   * @core
   */
  public readonly i18n: I18N;

  /**
   * Component ID
   * @core
   */
  public readonly uid?: string;

  /**
   * Has been init ? (attached & _init())
   * @core
   */
  protected _isInit?: boolean;

  /**
   * Have u met T... Slots ? (slot)
   * @remark We fill this object with slot only (not au-slot)
   * @core
   */
  public slots: Record<string, Element> = {};

  /**
   * Have u met T... AuSlots ? (au-slot)
   * @remark We fill this object with au-slot only (just the name)
   * @core
   */
  public auSlots: Record<string, boolean> = {};

  /**
   * Array of au-slot names
   * @core
   */
  public auSlotNames: string[];

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

  // /**
  //  * Alert service
  //  */
  // public readonly alertService?: IAlertService;

  /** Données encapsulées  */
  @bindable()
  public embedData?: EBD;

  /**
   * Event au changement de valeur
   * évènement à appeler via la fonction .call et non .bind
   * @type callback
   * @input newValue
   * @input oldValue
   * @input embedData
   */
  @bindable()
  public changed?: (...args) => void;

  constructor(protected _element: Element, protected _container: IContainer) {
    this.uid = `au2-comp-${BaseComponent._COUNTER++}`;
    this._auSlotInfo = this._container.get(IAuSlotsInfo);
    this._ea = this._container.get(IEventAggregator);
    this._platform = this._container.get(IPlatform);
    if (this._container.has(I18N, true)) {
      this.i18n = this._container.get(I18N);
    } else {
      console.debug('I18N cannot be used without right configuration.');
    }
    // this.alertService = SharedContainer.instance.get(IAlertService);
  }

  /** Permet de savoir si un slot existe */
  public async attached(): Promise<void> {
    try {
      // Récupère les slots si besoin
      this._refreshSlots();

      this.isBusy = true;
      await Promise.resolve(this._init());
      this._isInit = true;
    } finally {
      this.isBusy = false;
    }
  }

  /**
   * Custom logic (after attached)
   */
  protected _init(): void | Promise<void> {
    //
  }

  /** Custom logic (after detached) */
  protected _deinit(): void | Promise<void> {
    //
  }

  /**
   * Refresh slots and au-slots
   */
  private _refreshSlots() {
    this.auSlotNames = this._auSlotInfo.projectedSlots;
    this.auSlots = {};
    this.slots = {};
    if (this.auSlotNames.length) {
      this.auSlotNames.forEach(auSlotName => {
        this.auSlots[auSlotName] = true;
      });
    }

    if (this._element) {
      const slots = Array.from(this._element.children).filter(f => f.slot);
      for (let i = 0; i < slots.length; i++) {
        const sloti = slots[i];
        if (sloti) {
          this.slots[sloti.slot] = sloti;
        }
      }

      if (slots.length) {
        this.slotNames = Object.keys(this.slots);
      }
    }
  }

  /**
   * Dispose
   */
  public async dispose(): Promise<void> {
    this.slots = {};
    this.slotNames = [];
    this.auSlots = {};
    this.auSlotNames = [];
    disposeAntiBounces(this);
    await Promise.resolve(this._deinit());
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
