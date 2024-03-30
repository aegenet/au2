import { bindable, customElement, IContainer, inject, useShadowDOM } from 'aurelia';
import { BaseComponent } from '../src';

import template from './demo-component.html';
@customElement({
  name: 'demo-component',
  template,
})
@useShadowDOM({
  mode: 'open',
})
@inject(Element, IContainer)
export class DemoComponent extends BaseComponent {
  /** Current tab */
  @bindable()
  public tabSlot?: string;

  /** Else (test) */
  public something: string = '';

  constructor(element: Element, container: IContainer) {
    super(element, container);
  }

  /** @inheritdoc */
  protected async _init(): Promise<void> {
    // If any tab by default, we select the first one
    if (!this.tabSlot) {
      this.tabSlot = this.slotNames.length ? this.slotNames[0] : undefined;
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

  /**
   * (alt) Select a tab
   * @param tabSlot
   */
  public selectAlt = (tabSlot: string): void => {
    this.tabSlot = tabSlot;
  };
}
