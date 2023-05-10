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
  /** Tab actuel */
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
    // Si pas de tab par défaut, nous sélectionnons le premier
    if (!this.tabSlot) {
      this.tabSlot = this.slotNames.length ? this.slotNames[0] : undefined;
    }
    this.keys = await this._store.getStore('something');
    await super._init();
  }

  /**
   * Sélectionne un tab
   * @param tabSlot
   */
  public select(tabSlot: string): void {
    this.tabSlot = tabSlot;
  }

  /**
   * Sélectionne un tab
   * @param tabSlot
   */
  public selectAlt = (tabSlot: string): void => {
    this.tabSlot = tabSlot;
  };
}
