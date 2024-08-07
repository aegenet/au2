import type { IHydratedController } from '@aurelia/runtime-html';
import { bindable, customElement, inject, type ICustomElementViewModel } from 'aurelia';

import Prism from 'prismjs';
import 'prismjs/components/prism-cmake.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-json.js';

import 'prismjs/plugins/line-numbers/prism-line-numbers.js';

import styles from './prism-view.scss?inline';
import template from './prism-view.html?raw';

/**
 * CodeMirror
 */
@customElement({
  name: 'prism-view',
  template,
})
@inject(HTMLElement)
class PrismView implements ICustomElementViewModel {
  public codeArea?: HTMLElement;

  /** Code */
  @bindable()
  public code?: string;

  @bindable()
  public language: string = 'javascript';

  @bindable()
  public lineNumbers: boolean = false;

  constructor(private readonly _element: HTMLElement) {
    const style = document.createElement('style');
    // styles equals "section p{font-family:"Comic Sans MS"}"
    style.textContent = styles;
    this._element.appendChild(style);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public attached(initiator: IHydratedController): void | Promise<void> {
    this.codeChanged(this.code!, '');
  }

  public codeChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.codeArea!.textContent = newValue;
      Prism.highlightElement(this.codeArea as Element);
    }
  }
}

export { PrismView };
