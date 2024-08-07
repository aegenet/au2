import type { ICustomElementViewModel, IDisposable, IEventAggregator, TaskQueue } from 'aurelia';
import type { I18N } from '@aurelia/i18n';
import type { IAntiBounce, IAntiBounceSupport } from '@aegenet/belt-anti-bounce';
import type { ICustomElementAware } from './aware/i-custom-element-aware';

/**
 * Base component, with basic logic
 */
export interface IBaseComponent<EBD = unknown>
  extends ICustomElementViewModel,
    IAntiBounceSupport,
    ICustomElementAware {
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
   * Component ID
   * @core
   */
  readonly uid?: string;

  /**
   * Specify a special name for this instance
   *
   * "Je suis spécial !"
   */
  eventName?: string;

  /**
   * Have u met T... Slots? (slot)
   * @remark We fill this object with slot only (not au-slot)
   * @core
   */
  slots: Record<string, Element>;

  /**
   * Have u met T... AuSlots? (au-slot)
   * @remark We fill this object with au-slot only (just the name)
   * @core
   */
  auSlots: Record<string, boolean>;

  /**
   * Array of au-slot names
   * @core
   */
  auSlotNames?: string[];

  /**
   * Array of slot names
   * @core
   */
  slotNames: string[];

  /**
   * Last error message
   * @core
   */
  lastError?: string;

  /**
   * Is busy ?
   * @core
   */
  isBusy?: boolean;

  /** Embed data */
  embedData?: EBD;

  /**
   * This predicate is called when the value of the bindable (value) property changes.
   *
   * @type callback
   * @input newValue
   * @input oldValue
   * @input embedData
   */
  changed?: (...args: unknown[]) => void;

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
