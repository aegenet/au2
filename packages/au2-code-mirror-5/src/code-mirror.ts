import { bindable, customElement, inject, type ICustomElementViewModel } from 'aurelia';
import CodeMirrorLib, { EditorEventMap, HintFunction } from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/cmake/cmake';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/javascript-hint';
const isNodeJS = typeof process === 'object';

import styles from './code-mirror.scss?inline';
import template from './code-mirror.html?raw';

/**
 * CodeMirror
 */
@inject(HTMLElement)
@customElement({
  name: 'code-mirror',
  template,
})
export class CodeMirror implements ICustomElementViewModel {
  private _codeMirror?: CodeMirrorLib.Editor;
  public codeArea!: HTMLDivElement;

  /** Code */
  @bindable()
  public code?: string;

  @bindable()
  public language = 'javascript';

  @bindable()
  public theme = 'abcdef';

  @bindable()
  public suggestions: Array<{ term: string | RegExp; values: string[] }> = [];

  @bindable()
  public readOnly = false;

  @bindable()
  public lineNumbers = false;

  @bindable()
  public autofocus: boolean = false;

  private _boundedChange?: () => void;
  private _boundedFocus?: () => void;

  constructor(private readonly _element: HTMLElement) {
    const style = document.createElement('style');
    // styles equals "section p{font-family:"Comic Sans MS"}"
    style.textContent = styles;
    this._element.appendChild(style);

    // const shadowRoot = this._element.attachShadow({ mode: 'open' });
    // shadowRoot.appendChild(style);
  }

  public attached(): void | Promise<void> {
    // console.log(css);
    const code = this.code;
    const options: CodeMirrorLib.EditorConfiguration = {
      value: code,
      mode: this.language,
      theme: this.theme,
      lineNumbers: this.lineNumbers,
      tabSize: 2,
      viewportMargin: Infinity,
      readOnly: this.readOnly,
      autofocus: this.autofocus,
      // Issue with JSDOM (nodejs only)
      lineWrapping: isNodeJS ? false : true,
    };

    if (this.suggestions?.length) {
      options.extraKeys = { 'Ctrl-Space': 'autocomplete' };
      options.hintOptions = {
        hint: this._hintFunction.bind(this) as HintFunction,
        container: this.codeArea,
      };
    }

    this._codeMirror = CodeMirrorLib(this.codeArea, options);

    /** Sync */
    this._boundedChange = function (this: CodeMirror) {
      const currentValue = this._codeMirror!.getValue();
      if (this.code !== currentValue) {
        this.code = currentValue;
      }
    }.bind(this);
    this._codeMirror.on('change', this._boundedChange);

    if (this.autofocus) {
      this._boundedFocus = (() => {
        this._setCursorAtEnd();
        this._codeMirror!.off('focus', this._boundedFocus as EditorEventMap['focus']);
      }).bind(this);
      /** Once, at begin */
      this._codeMirror.on('focus', this._boundedFocus);
    }
  }

  public codeChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      if (newValue !== this._codeMirror!.getValue()) {
        this._codeMirror!.setValue(newValue);
        // this._codeMirror.focus();
        this._setCursorAtEnd();
      }
    }
  }

  /** Set the cursor at the end of existing content */
  private _setCursorAtEnd() {
    this._codeMirror!.setCursor(this._codeMirror!.lineCount(), 0);
  }

  private _hintFunction(cm: CodeMirrorLib.Editor, options?: { line?: number; ch?: number }) {
    //
    return new Promise((accept: (hints: CodeMirrorLib.Hints | null | undefined) => void) => {
      const cursor = cm.getCursor();
      const line = cm.getLine(options?.line ?? cursor.line);
      let start = options?.ch ?? cursor.ch;
      let end = options?.ch ?? cursor.ch;
      while (start > 0 && /\w/.test(line.charAt(start - 1))) --start;
      while (end < line.length && /\w/.test(line.charAt(end))) ++end;
      const partLine = line.slice(0, end).toLowerCase();
      let suggests: string[] = [];
      for (let i = 0; i < this.suggestions.length; i++) {
        const suggest = this.suggestions[i];
        if (typeof suggest.term === 'string') {
          if (suggest.term === partLine) {
            suggests = suggest.values;
            break;
          }
        } else {
          if (suggest.term.test(partLine)) {
            suggests = suggest.values;
            break;
          }
        }
      }
      if (suggests.length) {
        accept({
          list: suggests,
          from: CodeMirrorLib.Pos(cursor.line, start),
          to: CodeMirrorLib.Pos(cursor.line, end),
        });
      } else {
        accept(null);
      }
    });
  }

  public detaching(): void | Promise<void> {
    if (this._codeMirror) {
      if (this._boundedChange) {
        this._codeMirror.off('change', this._boundedChange);
      }
      this.codeArea.removeChild(this.codeArea.firstElementChild!);
      this._codeMirror = undefined;
    }
  }
}
