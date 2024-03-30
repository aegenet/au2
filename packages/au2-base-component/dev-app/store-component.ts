import { bindable, customElement, IContainer, inject, useShadowDOM } from 'aurelia';
import { BaseComponent } from '../src';

import template from './store-component.html';
@customElement({
  name: 'store-component',
  template,
})
@useShadowDOM({
  mode: 'open',
})
@inject(Element, IContainer)
export class StoreComponent extends BaseComponent {
  /** Current tab */
  @bindable()
  public tabSlot?: string;

  /** Else (for test) */
  public something: string = '';
  public keys: string[];

  constructor(element: Element, container: IContainer) {
    super(element, container);
    this._store.setStore({
      key: 'something',
      async load() {
        return ['a', 'b', 'c'];
      },
    });
  }

  /** @inheritdoc */
  protected async _init(): Promise<void> {
    // If any tab by default, we select the first one
    if (!this.tabSlot) {
      this.tabSlot = this.slotNames.length ? this.slotNames[0] : undefined;
    }
    this.keys = await this._store.getStore('something');
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
   * Select a tab (alt)
   * @param tabSlot
   */
  public selectAlt = (tabSlot: string): void => {
    this.tabSlot = tabSlot;
  };
}
