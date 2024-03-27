import { IContainer, customElement, inject } from 'aurelia';
import { BasePage } from '../src';

import template from './demo-page.html';
@customElement({
  name: 'demo-page',
  template,
})
@inject(IContainer)
export class DemoPage extends BasePage {
  //
}
