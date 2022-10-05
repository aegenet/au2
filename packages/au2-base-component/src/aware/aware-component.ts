import { customElement, inject, IContainer, bindable } from 'aurelia';
import { BaseComponent } from '../base-component';
import type { IAwareComponent } from './i-aware-component';
import type { IAwareEvent } from './i-aware-event';

/**
 * Aware Component
 *
 * @category components/events
 *
 * @story Simple
 * ```html
 * <let is-checked.bind="false"></let>
 * <let next-has-been-called.bind="false"></let>
 *
 * <ra-checkbox event-name="my-box" value.bind="isChecked"></ra-checkbox>
 *
 * <aware-component view-model.ref="awareEvRef"
 *    events.bind="[{ name: 'ra-checkbox:my-box', options: { property: 'value', value: !isChecked } }]"
 *    next.call="nextHasBeenCalled = true"
 * >
 *      Toggled via event
 * </aware-component>
 *
 * <button
 *    click.trigger"awareEvRef.publish()"
 * >
 *      Toggled via event
 * </button>
 *
 * <div class="m-5">Result: <strong>${isChecked}</strong> (next called: ${nextHasBeenCalled})</div>
 * ```
 */
@customElement({
  name: 'aware-component',
})
@inject(Element, IContainer)
export class AwareComponent<EBD = unknown> extends BaseComponent<EBD> implements IAwareComponent<EBD> {
  /**
   * Events
   */
  @bindable()
  public events: Array<{ name: string; options: IAwareEvent }> = [];

  /** Next */
  @bindable()
  public next?: (source: AwareComponent) => void | Promise<void>;

  constructor(element: Element, container: IContainer) {
    super(element, container);
  }

  /** Publish the event */
  public async publish(): Promise<void> {
    if (this.events) {
      for (let i = 0; i < this.events.length; i++) {
        this._ea.publish(this.events[i].name, this.events[i].options);
      }
    }

    if (this.next) {
      await this.next(this);
    }
  }
}
