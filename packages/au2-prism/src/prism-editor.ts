/** Disclaimer: inspired by https://github.com/koca/vue-prism-editor/ */
import type { IHydratedController } from '@aurelia/runtime-html';
import { bindable, customElement, inject, type ICustomElementViewModel } from 'aurelia';

import Prism from 'prismjs';
import 'prismjs/components/prism-cmake.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-json.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';

const isWindows = typeof window !== 'undefined' && navigator && /Win/i.test(navigator.platform);
const isMacLike = typeof window !== 'undefined' && navigator && /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

export interface EditorProps {
  lineNumbers: boolean;
  autoStyleLineNumbers: boolean;
  readonly: boolean;
  value: string;
  highlight: (...args: unknown[]) => unknown;
  tabSize: number;
  insertSpaces: boolean;
  ignoreTabKey: boolean;
  placeholder: string;
}

export interface Record {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface History {
  stack: Array<Record & { timestamp: number }>;
  offset: number;
}

import styles from './prism-editor.scss?inline';
import template from './prism-editor.html?raw';

/**
 * Prism Editor
 */
@inject(HTMLElement)
@customElement({
  name: 'prism-editor',
  template,
})
class PrismEditor implements ICustomElementViewModel {
  private static readonly _KEY_ENTER = 'Enter';
  private static readonly _KEY_TAB = 'Tab';
  private static readonly _KEY_BACKSPACE = 'Backspace';
  private static readonly _KEY_Y = 'y';
  private static readonly _KEY_Z = 'z';
  private static readonly _KEY_M = 'm';
  private static readonly _KEY_PARENS = '(';
  private static readonly _KEY_BRACKETS = '{';
  private static readonly _KEY_QUOTE = '"';
  private static readonly _KEY_BACK_QUOTE = "'";
  private static readonly _KEY_ESCAPE = 'Escape';

  private static readonly _HISTORY_LIMIT = 100;
  private static readonly _HISTORY_TIME_GAP = 3000;

  public preRef?: HTMLPreElement;
  public textAreaRef?: HTMLTextAreaElement;
  private _boundedKeydown?: (e: KeyboardEvent) => boolean | void;

  constructor(private readonly _element: HTMLElement) {
    const style = document.createElement('style');
    // styles equals "section p{font-family:"Comic Sans MS"}"
    style.textContent = styles;
    this._element.appendChild(style);
  }

  @bindable()
  public lineNumbers: boolean = false;

  public lineNumbersChanged(): void {
    this.styleLineNumbers();
    this.setLineNumbersHeight();
  }

  @bindable()
  public autoStyleLineNumbers: boolean = true;

  @bindable()
  public readonly: boolean = false;

  @bindable()
  public code: string = '';

  @bindable()
  public highlight?: () => string;

  @bindable()
  public tabSize: number = 2;

  @bindable()
  public insertSpaces: boolean = true;

  @bindable()
  public ignoreTabKey: boolean = false;

  @bindable()
  public placeholder: string = '';

  public contentChanged() {
    if (this.lineNumbers) {
      this.setLineNumbersHeight();
    }
  }

  public get isEmpty(): boolean {
    return this.code?.length === 0;
  }

  public generateContent(): string {
    const result = Prism.highlight(this.code, Prism.languages['javascript'], 'javascript') + '<br />';
    // todo: VNode support?
    this.contentChanged();
    return result;
  }

  public get lineNumbersCount(): number {
    const totalLines = this.code.split(/\r\n|\n/).length;
    return totalLines;
  }

  public capture: boolean = true;
  public history: History = {
    stack: [],
    offset: -1,
  };
  public lineNumbersHeight: string = '20px';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public bound(initiator: IHydratedController, parent: IHydratedController): void | Promise<void> {
    if (this.code == null) {
      this.code = '';
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public attached(initiator: IHydratedController): void | Promise<void> {
    this.styleLineNumbers();
    this._boundedKeydown = this.handleKeyDown.bind(this);
    this.textAreaRef!.addEventListener('keydown', this._boundedKeydown);
    this.codeChanged(this.code, this.code);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public detaching(initiator: IHydratedController, parent: IHydratedController): void | Promise<void> {
    if (this._boundedKeydown) {
      this.textAreaRef!.removeEventListener('keydown', this._boundedKeydown);
    }
  }

  public setLineNumbersHeight(): void {
    this.lineNumbersHeight = getComputedStyle(this.preRef as HTMLPreElement).height;
  }

  public styleLineNumbers(): void {
    if (!this.lineNumbers || !this.autoStyleLineNumbers) return;

    const $editor = this.preRef as HTMLPreElement;
    const $lineNumbers: HTMLDivElement | null = this._element.querySelector('.prism-editor__line-numbers');
    const editorStyles = window.getComputedStyle($editor);

    // PLATFORM.taskQueue.queueTask(() => {
    const btlr: any = 'border-top-left-radius';
    const bblr: any = 'border-bottom-left-radius';
    if (!$lineNumbers) return;
    $lineNumbers.style[btlr] = editorStyles[btlr];
    $lineNumbers.style[bblr] = editorStyles[bblr];
    $editor.style[btlr] = '0';
    $editor.style[bblr] = '0';

    const stylesList = ['background-color', 'margin-top', 'padding-top', 'font-family', 'font-size', 'line-height'];
    stylesList.forEach((style: any) => {
      $lineNumbers.style[style] = editorStyles[style];
    });
    $lineNumbers.style['margin-bottom' as any] = '-' + editorStyles['padding-top' as any];
    // });
  }

  private _getLines(text: string, position: number): Array<string> {
    return text.substring(0, position).split('\n');
  }

  private _applyEdits(record: Record): void {
    // Save last selection state
    const input = this.textAreaRef as HTMLTextAreaElement;
    const last = this.history.stack[this.history.offset];
    if (last && input) {
      this.history.stack[this.history.offset] = {
        ...last,
        selectionStart: input.selectionStart,
        selectionEnd: input.selectionEnd,
      };
    }

    // Save the changes
    this._recordChange(record);
    this._updateInput(record);
  }

  private _recordChange(record: Record, overwrite = false): void {
    const { stack, offset } = this.history;

    if (stack.length && offset > -1) {
      // When something updates, drop the redo operations
      this.history.stack = stack.slice(0, offset + 1);

      // Limit the number of operations to 100
      const count = this.history.stack.length;

      if (count > PrismEditor._HISTORY_LIMIT) {
        const extras = count - PrismEditor._HISTORY_LIMIT;

        this.history.stack = stack.slice(extras, count);
        this.history.offset = Math.max(this.history.offset - extras, 0);
      }
    }

    const timestamp = Date.now();

    if (overwrite) {
      const last = this.history.stack[this.history.offset];

      if (last && timestamp - last.timestamp < PrismEditor._HISTORY_TIME_GAP) {
        // A previous entry exists and was in short interval

        // Match the last word in the line
        const re = /[^a-z0-9]([a-z0-9]+)$/i;

        // Get the previous line
        const previous = this._getLines(last.value, last.selectionStart).pop()?.match(re);

        // Get the current line
        const current = this._getLines(record.value, record.selectionStart).pop()?.match(re);

        if (previous && current && current[1].startsWith(previous[1])) {
          // The last word of the previous line and current line match
          // Overwrite previous entry so that undo will remove whole word
          this.history.stack[this.history.offset] = {
            ...record,
            timestamp,
          };

          return;
        }
      }
    }

    // Add the new operation to the stack
    this.history.stack.push({ ...record, timestamp });
    this.history.offset++;
  }

  private _updateInput(record: Record): void {
    const input = this.textAreaRef as HTMLTextAreaElement;

    if (!input) return;

    // Update values and selection state
    // On change la value
    this.code = record.value || '';
    input.value = record.value;
    input.selectionStart = record.selectionStart;
    input.selectionEnd = record.selectionEnd;

    // this.$emit('input', record.value);
    // this.props.onValueChange(record.value);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public codeChanged(newValue: string, oldValue: string) {
    if (newValue == null) {
      this.code = '';
    }

    const { value, selectionStart, selectionEnd } = this.textAreaRef as HTMLTextAreaElement;

    this._recordChange(
      {
        value,
        selectionStart,
        selectionEnd,
      },
      true
    );

    this.preRef!.innerHTML = this.generateContent();
  }
  // public handleChange(e: KeyboardEvent): void {
  //   this.$emit('input', value);
  //   // this.props.onValueChange(value);
  // }

  /** Undo */
  public undo(): void {
    const { stack, offset } = this.history;

    // Get the previous edit
    const record = stack[offset - 1];

    if (record) {
      // Apply the changes and update the offset
      this._updateInput(record);
      this.history.offset = Math.max(offset - 1, 0);
    }
  }

  /** Redo */
  private redo(): void {
    const { stack, offset } = this.history;

    // Get the next edit
    const record = stack[offset + 1];

    if (record) {
      // Apply the changes and update the offset
      this._updateInput(record);
      this.history.offset = Math.min(offset + 1, stack.length - 1);
    }
  }

  public handleKeyDown(e: KeyboardEvent): boolean | void {
    // console.log(navigator.platform);
    const { tabSize, insertSpaces, ignoreTabKey } = this;

    // if (this.$listeners.keydown) {
    // onKeyDown(e);
    // this.$emit('keydown', e);

    if (e.defaultPrevented) {
      return;
    }
    // }

    if (e.key === PrismEditor._KEY_ESCAPE) {
      (<HTMLTextAreaElement>e.target).blur();
      this.$emit('blur', e);
    }

    const { value, selectionStart, selectionEnd } = e.target as HTMLTextAreaElement;

    const tabCharacter = (insertSpaces ? ' ' : '\t').repeat(tabSize);

    if (e.key === PrismEditor._KEY_TAB && !ignoreTabKey && this.capture) {
      // Prevent focus change
      e.preventDefault();

      if (e.shiftKey) {
        // Unindent selected lines
        const linesBeforeCaret = this._getLines(value, selectionStart);
        const startLine = linesBeforeCaret.length - 1;
        const endLine = this._getLines(value, selectionEnd).length - 1;
        const nextValue = value
          .split('\n')
          .map((line, i) => {
            if (i >= startLine && i <= endLine && line.startsWith(tabCharacter)) {
              return line.substring(tabCharacter.length);
            }

            return line;
          })
          .join('\n');

        if (value !== nextValue) {
          const startLineText = linesBeforeCaret[startLine];

          this._applyEdits({
            value: nextValue,
            // Move the start cursor if first line in selection was modified
            // It was modified only if it started with a tab
            selectionStart: startLineText.startsWith(tabCharacter)
              ? selectionStart - tabCharacter.length
              : selectionStart,
            // Move the end cursor by total number of characters removed
            selectionEnd: selectionEnd - (value.length - nextValue.length),
          });
        }
      } else if (selectionStart !== selectionEnd) {
        // Indent selected lines
        const linesBeforeCaret = this._getLines(value, selectionStart);
        const startLine = linesBeforeCaret.length - 1;
        const endLine = this._getLines(value, selectionEnd).length - 1;
        const startLineText = linesBeforeCaret[startLine];

        this._applyEdits({
          value: value
            .split('\n')
            .map((line, i) => {
              if (i >= startLine && i <= endLine) {
                return tabCharacter + line;
              }

              return line;
            })
            .join('\n'),
          // Move the start cursor by number of characters added in first line of selection
          // Don't move it if it there was no text before cursor
          selectionStart: /\S/.test(startLineText) ? selectionStart + tabCharacter.length : selectionStart,
          // Move the end cursor by total number of characters added
          selectionEnd: selectionEnd + tabCharacter.length * (endLine - startLine + 1),
        });
      } else {
        const updatedSelection = selectionStart + tabCharacter.length;

        this._applyEdits({
          // Insert tab character at caret
          value: value.substring(0, selectionStart) + tabCharacter + value.substring(selectionEnd),
          // Update caret position
          selectionStart: updatedSelection,
          selectionEnd: updatedSelection,
        });
      }
    } else if (e.key === PrismEditor._KEY_BACKSPACE) {
      const hasSelection = selectionStart !== selectionEnd;
      const textBeforeCaret = value.substring(0, selectionStart);

      if (textBeforeCaret.endsWith(tabCharacter) && !hasSelection) {
        // Prevent default delete behaviour
        e.preventDefault();

        const updatedSelection = selectionStart - tabCharacter.length;

        this._applyEdits({
          // Remove tab character at caret
          value: value.substring(0, selectionStart - tabCharacter.length) + value.substring(selectionEnd),
          // Update caret position
          selectionStart: updatedSelection,
          selectionEnd: updatedSelection,
        });
      }
    } else if (e.key === PrismEditor._KEY_ENTER) {
      // Ignore selections
      if (selectionStart === selectionEnd) {
        // Get the current line
        const line = this._getLines(value, selectionStart).pop();
        const matches = line?.match(/^\s+/);

        if (matches && matches[0]) {
          e.preventDefault();

          // Preserve indentation on inserting a new line
          const indent = '\n' + matches[0];
          const updatedSelection = selectionStart + indent.length;

          this._applyEdits({
            // Insert indentation character at caret
            value: value.substring(0, selectionStart) + indent + value.substring(selectionEnd),
            // Update caret position
            selectionStart: updatedSelection,
            selectionEnd: updatedSelection,
          });
        }
      }
    } else if (
      e.key === PrismEditor._KEY_PARENS ||
      e.key === PrismEditor._KEY_BRACKETS ||
      e.key === PrismEditor._KEY_QUOTE ||
      e.key === PrismEditor._KEY_BACK_QUOTE
    ) {
      let chars;

      if (e.key === PrismEditor._KEY_PARENS && e.shiftKey) {
        chars = ['(', ')'];
      } else if (e.key === PrismEditor._KEY_BRACKETS) {
        if (e.shiftKey) {
          chars = ['{', '}'];
        } else {
          chars = ['[', ']'];
        }
      } else if (e.key === PrismEditor._KEY_QUOTE) {
        if (e.shiftKey) {
          chars = ['"', '"'];
        } else {
          chars = ["'", "'"];
        }
      } else if (e.key === PrismEditor._KEY_BACK_QUOTE && !e.shiftKey) {
        chars = ['`', '`'];
      }

      // console.log(isMacLike, "navigator" in global && /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));

      // If text is selected, wrap them in the characters
      if (selectionStart !== selectionEnd && chars) {
        e.preventDefault();

        this._applyEdits({
          value:
            value.substring(0, selectionStart) +
            chars[0] +
            value.substring(selectionStart, selectionEnd) +
            chars[1] +
            value.substring(selectionEnd),
          // Update caret position
          selectionStart,
          selectionEnd: selectionEnd + 2,
        });
      }
    } else if (
      (isMacLike
        ? // Trigger undo with ⌘+Z on Mac
          e.metaKey && e.key === PrismEditor._KEY_Z
        : // Trigger undo with Ctrl+Z on other platforms
          e.ctrlKey && e.key === PrismEditor._KEY_Z) &&
      !e.shiftKey &&
      !e.altKey
    ) {
      e.preventDefault();

      this.undo();
    } else if (
      (isMacLike
        ? // Trigger redo with ⌘+Shift+Z on Mac
          e.metaKey && e.key === PrismEditor._KEY_Z && e.shiftKey
        : isWindows
          ? // Trigger redo with Ctrl+Y on Windows
            e.ctrlKey && e.key === PrismEditor._KEY_Y
          : // Trigger redo with Ctrl+Shift+Z on other platforms
            e.ctrlKey && e.key === PrismEditor._KEY_Z && e.shiftKey) &&
      !e.altKey
    ) {
      e.preventDefault();

      this.redo();
    } else if (e.key === PrismEditor._KEY_M && e.ctrlKey && (isMacLike ? e.shiftKey : true)) {
      e.preventDefault();

      // Toggle capturing tab key so users can focus away
      this.capture = !this.capture;
    }
  }

  public $emit(evName: string, params: any) {
    // this.preRef.dispatchEvent(new Event(evName, params));
    console.log(evName, params);
  }
}

export { PrismEditor };
