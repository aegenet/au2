import { bindable, containerless, customElement, IContainer, inject } from 'aurelia';
import { BaseComponent } from '../base-component';
import { defaultCapture } from '../common/default-capture';
import type { IAwareEvent } from './i-aware-event';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import tpl from './aware-event-button.html';

/**
 * Basic Aware Event button
 */
@customElement({
  name: 'aware-event-button',
  template: tpl,
  capture: defaultCapture,
})
@containerless()
@inject(Element, IContainer)
export class AwareEventButton<EBD = unknown> extends BaseComponent<EBD> {
  /**
   * Event name
   *
   * @example component-name:event-name
   */
  @bindable()
  public eventName: string = '';

  /**
   * Property
   */
  @bindable()
  public property: string;

  /** Value(s) */
  @bindable()
  public value: unknown | unknown[];

  /** Next */
  @bindable()
  public next?: (value: unknown, embedData: EBD) => void | Promise<void>;

  constructor(element: Element, container: IContainer) {
    super(element, container);
  }

  /** Publish the event */
  public async publish() {
    this._ea.publish(this.eventName, {
      property: this.property,
      value: this.value,
    } as IAwareEvent);

    if (this.next) {
      await this.next(this.value, this.embedData);
    }
  }
}
