import { customElement, IContainer, inject } from 'aurelia';
import { defaultCapture, BaseComponent } from '../src';

import template from './demo-default-capture.html';

/**
 * Demo default capture
 */
@customElement({
  name: 'demo-default-capture',
  template,
  capture: defaultCapture,
})
@inject(Element, IContainer)
export class DemoDefaultCapture<EBD = unknown> extends BaseComponent<EBD> {
  public clickCount: number = 0;

  constructor(element: Element, container: IContainer) {
    super(element, container);
  }

  public doAction(): void {
    this.clickCount++;
  }
}
