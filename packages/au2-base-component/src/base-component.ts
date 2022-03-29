import { bindable, IAuSlotsInfo, ICustomElementViewModel } from '@aurelia/runtime-html';
import { IContainer } from '@aurelia/kernel';

/**
 * Classe de base des composants
 */
export class BaseComponent implements ICustomElementViewModel {
  private static _COUNTER: number = 1;

  /** AU Slot informations */
  private readonly _auSlotInfo: IAuSlotsInfo;

  /** UID unique du composant */
  public readonly uid?: string;

  /** Composant initialisé ? */
  protected _isInit?: boolean;

  /**
   * Have u met T... Slots ? (slot)
   * @remark We don't fill this object with au-slot, we can't atm !
   */
  public slots: Record<string, Element> = {};

  /** Array of au-slot names */
  public auSlotNames: string[];

  /** Array of slot names */
  public slotNames: string[] = [];

  /** Dernier message d'erreur */
  public errorMessage?: string;

  /** Composant occupé ? */
  public isBusy?: boolean;

  // /**
  //  * Alert service
  //  */
  // public readonly alertService?: IAlertService;

  /** Données encapsulées  */
  @bindable()
  public embedData: unknown = null;

  /**
   * Event au changement de valeur
   * évènement à appeler via la fonction .call et non .bind
   * @type callback
   * @input newValue
   * @input oldValue
   * @input embedData
   */
  @bindable()
  public changed: (...args) => void = null;

  constructor(protected _element: Element, protected _container: IContainer) {
    this.uid = `au2-comp-${BaseComponent._COUNTER++}`;
    this._auSlotInfo = this._container.get(IAuSlotsInfo);
    // this.alertService = SharedContainer.instance.get(IAlertService);
  }

  /** Permet de savoir si un slot existe */
  public async attached(): Promise<void> {
    try {
      // Récupère les slots si besoin
      this._refreshSlots();

      this.isBusy = true;
      await Promise.resolve(this._initialized());
      this._isInit = true;
    } finally {
      this.isBusy = false;
    }
  }

  /**
   * Custom logic (after attached)
   */
  protected _initialized(): void | Promise<void> {
    //
  }

  protected _deinit(): void | Promise<void> {
    //
  }

  /**
   * Met à jour notre liste de slots
   */
  private _refreshSlots() {
    this.auSlotNames = this._auSlotInfo.projectedSlots;

    if (this._element) {
      const slots = Array.from(this._element.children).filter(f => f.slot /* || f.attributes['au-slot']?.value*/);
      for (let i = 0; i < slots.length; i++) {
        const sloti = slots[i];
        if (sloti) {
          this.slots[sloti.slot /* || sloti.attributes['au-slot'].value */] = sloti;
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
    this.auSlotNames = [];
    await Promise.resolve(this._deinit());
    this._isInit = false;
  }
}
