import { bindable, customElement, IContainer, inject } from 'aurelia';
import { BaseComponent } from '../src';

@customElement('demo-component')
@inject(Element, IContainer)
export class DemoComponent extends BaseComponent {
  /** Tab actuel */
  @bindable()
  public tabSlot?: string;

  constructor(element: Element, container: IContainer) {
    super(element, container);
  }

  protected async _initialized(): Promise<void> {
    // Si pas de tab par défaut, nous sélectionnons le premier
    if (!this.tabSlot) {
      this.tabSlot = this.slotNames.length ? this.slotNames[0] : undefined;
    }
    await super._initialized();
  }

  /**
   * Sélectionne un tab
   * @param tabSlot
   */
  public select(tabSlot: string): void {
    this.tabSlot = tabSlot;
  }
}
