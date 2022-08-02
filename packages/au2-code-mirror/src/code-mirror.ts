import { bindable, customElement, type ICustomElementViewModel } from 'aurelia';

import styles from './code-mirror.scss';
import template from './code-mirror.html';

import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { json } from '@codemirror/lang-json';

/**
 * CodeMirror
 */
@customElement({
  name: 'code-mirror',
  template,
})
export class CodeMirror implements ICustomElementViewModel {
  private _codeMirror: EditorView; // CodeMirror.Editor;
  public codeArea: HTMLDivElement;

  /** Code */
  @bindable()
  public code: string;

  constructor(private readonly _element: HTMLElement) {
    const style = document.createElement('style');
    // styles equals "section p{font-family:"Comic Sans MS"}"
    style.textContent = styles;
    this._element.appendChild(style);
  }

  public attached(): void | Promise<void> {
    const code = this.code;
    this._codeMirror = new EditorView({
      state: EditorState.create({
        doc: code,
        extensions: [basicSetup, json()],
      }),
      parent: this.codeArea,
    });
  }

  public codeChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      if (newValue !== this._codeMirror.state.doc.toString()) {
        this._codeMirror.dispatch({
          changes: { from: 0, to: this._codeMirror.state.doc.length, insert: newValue },
        });
        this._setCursorAtEnd();
      }
    }
  }

  /** Set the cursor at the end of existing content */
  private _setCursorAtEnd() {
    this._codeMirror.dispatch({ selection: { anchor: this._codeMirror.state.doc.lines } });
  }

  public detaching(): void | Promise<void> {
    if (this._codeMirror) {
      this._codeMirror.destroy();
      this._codeMirror = null;
    }
  }
}
