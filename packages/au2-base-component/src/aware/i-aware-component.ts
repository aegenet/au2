import type { BaseComponent } from '../base-component';
import type { IAwareEvent } from './i-aware-event';

/**
 * Aware Component Interface
 */
export interface IAwareComponent<EBD = unknown> extends BaseComponent<EBD> {
  /**
   * Events
   */
  events: Array<{ name: string; options: IAwareEvent }>;

  /** Next */
  next?: (source: IAwareComponent) => void | Promise<void>;

  /** Publish the event */
  publish(): Promise<void>;
}
