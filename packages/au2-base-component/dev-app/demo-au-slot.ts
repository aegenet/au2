import { bindable, customElement, IContainer, inject } from 'aurelia';
import { AU2BaseComponent } from '../src';

@customElement('demo-au-slot')
@inject(Element, IContainer)
export class DemoAuSlot extends AU2BaseComponent {
  /** Tab actuel */
  @bindable()
  public tabSlot?: string;

  constructor(element: Element, container: IContainer) {
    super(element, container);
  }

  protected async _initialized(): Promise<void> {
    // Si pas de tab par défaut, nous sélectionnons le premier
    if (!this.tabSlot) {
      this.tabSlot = this.auSlotNames.length ? this.auSlotNames[0] : undefined;
    }
    await super._initialized();
  }
}
