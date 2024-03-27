import { IContainer, customElement, inject } from 'aurelia';
import { BasePage } from '../src';

import template from './demo-page-2.html';
@customElement({
  name: 'demo-page-2',
  template,
})
@inject(IContainer)
export class DemoPage2 extends BasePage {
  //
}
