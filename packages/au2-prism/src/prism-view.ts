import { IHydratedController } from '@aurelia/runtime-html';
import { bindable, customElement, LifecycleFlags, type ICustomElementViewModel } from 'aurelia';

import Prism from 'prismjs';
import 'prismjs/components/prism-cmake.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-json.js';

import 'prismjs/plugins/line-numbers/prism-line-numbers.js';

import styles from './prism-view.scss';
import template from './prism-view.html';

/**
 * CodeMirror
 */
@customElement({
  name: 'prism-view',
  template,
})
export class PrismView implements ICustomElementViewModel {
  public codeArea: HTMLElement;

  /** Code */
  @bindable()
  public code: string;

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

  public attached(initiator: IHydratedController, flags: LifecycleFlags): void | Promise<void> {
    this.codeChanged(this.code, '');
  }

  public codeChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.codeArea.textContent = newValue;
      Prism.highlightElement(this.codeArea);
    }
  }
}
