import { bindable, customElement, IContainer, inject } from 'aurelia';
import { BaseComponent } from '../src';

import template from './demo-au-slot.html';
@customElement({
  name: 'demo-au-slot',
  template,
})
@inject(Element, IContainer)
export class DemoAuSlot extends BaseComponent {
  /** Current tab */
  @bindable()
  public tabSlot?: string;

  constructor(element: Element, container: IContainer) {
    super(element, container);
  }

  protected async _init(): Promise<void> {
    // If any tab by default, we select the first one
    if (!this.tabSlot) {
      this.tabSlot = this.auSlotNames.length ? this.auSlotNames[0] : undefined;
    }
    await super._init();
  }

  /**
   * Select a tab
   * @param tabSlot
   */
  public select(tabSlot: string): void {
    this.tabSlot = tabSlot;
  }
}
