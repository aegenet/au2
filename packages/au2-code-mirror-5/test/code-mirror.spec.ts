import { getViewModel, renderInDOM } from './helper';
import { CodeMirror } from '../src/index';

describe('code-mirror', () => {
  it('should render code', async () => {
    await renderInDOM('<code-mirror code="foo"></code-mirror>', [CodeMirror], async result => {
      expect(result.textContent.indexOf('foo') !== -1).toBe(true);
    });
  });

  it('should render code with language', async () => {
    const code = "const sample = { code: 'oh' };";
    await renderInDOM(`<code-mirror code="${code}" language="javascript"></code-mirror>`, [CodeMirror], async result => {
      expect(result.textContent.indexOf(code) !== -1).toBe(true);
    });
  });

  it('should render code modification', async () => {
    const code = "const sample = { code: 'oh' };";
    const newCode = "const yes = 'yes';";
    await renderInDOM(`<code-mirror autofocus.bind="true" code="${code}" language="javascript"></code-mirror>`, [CodeMirror], async result => {
      expect(result.textContent.indexOf(code) !== -1).toBe(true);
      const vm = getViewModel<CodeMirror>(result);
      expect(vm.code).toBe(code);
      vm.code = newCode;
      result.$aurelia.waitForIdle();
      expect(vm.code).toBe(newCode);
      expect(result.textContent.indexOf(newCode) !== -1).toBe(true);
    });
  });

  it('should render suggestions (none)', async () => {
    const code = "const sample = { code: 'oh' };";
    await renderInDOM(`<code-mirror autofocus.bind="true" code="${code}" suggestions.bind='[{ term: "<base-", values: ["<base-component>", "<base-page>"] }]' language="javascript"></code-mirror>`, [CodeMirror], async result => {
      expect(result.textContent.indexOf(code) !== -1).toBe(true);
      const vm = getViewModel<CodeMirror>(result);
      expect(vm.suggestions).toEqual([{ term: '<base-', values: ['<base-component>', '<base-page>'] }]);
      expect(vm.code).toBe(code);

      // const ctrlSpace = new window.KeyboardEvent('keydown', { key: 'Space', code: 'Space', ctrlKey: true });
      // document.dispatchEvent(ctrlSpace);
      await (vm as any)._hintFunction((vm as any)._codeMirror, { line: 0, ch: code.length });

      result.$aurelia.waitForIdle();
    });
  });

  it('should render suggestions', async () => {
    const code = '<base-';
    await renderInDOM(`<code-mirror autofocus.bind="true" code="${code}" suggestions.bind='[{ term: "<base-", values: ["<base-component>", "<base-page>"] }]' language="javascript"></code-mirror>`, [CodeMirror], async result => {
      expect(result.textContent.indexOf(code) !== -1).toBe(true);
      const vm = getViewModel<CodeMirror>(result);
      expect(vm.suggestions).toEqual([{ term: '<base-', values: ['<base-component>', '<base-page>'] }]);
      expect(vm.code).toBe(code);

      // const ctrlSpace = new window.KeyboardEvent('keydown', { key: 'Space', code: 'Space', ctrlKey: true });
      // document.dispatchEvent(ctrlSpace);
      await (vm as any)._hintFunction((vm as any)._codeMirror, { line: 0, ch: code.length });

      result.$aurelia.waitForIdle();
    });
  });
});
