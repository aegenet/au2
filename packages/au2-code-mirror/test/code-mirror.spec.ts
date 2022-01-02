import { getViewModel, renderInDOM } from './helper';
import { CodeMirror } from '../src/code-mirror';

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
});
