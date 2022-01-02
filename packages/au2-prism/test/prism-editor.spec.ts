import { getViewModel, renderInDOM } from './helper';
import { PrismEditor } from '../src/prism-editor';

describe('prism-editor', () => {
  it('should render code', async () => {
    await renderInDOM('<prism-editor code="foo"></prism-editor>', [PrismEditor], async result => {
      expect(result.textContent.indexOf('foo') !== -1).toBe(true);
    });
  });

  it('should render code with language', async () => {
    const code = "const sample = { code: 'oh' };";
    await renderInDOM(`<prism-editor code="${code}" language="javascript"></prism-editor>`, [PrismEditor], async result => {
      expect(result.textContent.indexOf(code) !== -1).toBe(true);
    });
  });

  it('should render code modification', async () => {
    const code = "const sample = { code: 'oh' };";
    const newCode = "const yes = 'yes';";
    await renderInDOM(`<prism-editor code="${code}" language="javascript"></prism-editor>`, [PrismEditor], async result => {
      expect(result.textContent.indexOf(code) !== -1).toBe(true);
      const vm = getViewModel<PrismEditor>(result);
      expect(vm.code).toBe(code);
      vm.code = newCode;
      result.$aurelia.waitForIdle();
      expect(vm.code).toBe(newCode);

      expect(result.textContent.indexOf(newCode) !== -1).toBe(true);
    });
  });

  it('should render lineNumbers', async () => {
    const code = "const sample = { code: 'oh' };\nconst tata = { ha: 'hoh' };";
    const newCode = "const yes = 'yes';";
    await renderInDOM(`<prism-editor line-numbers.bind="true" code="${code}" language="javascript"></prism-editor>`, [PrismEditor], async result => {
      expect(result.textContent.indexOf(code) !== -1).toBe(true);
      const vm = getViewModel<PrismEditor>(result);
      expect(vm.code).toBe(code);
      expect(vm.lineNumbersCount).toBe(2);

      vm.code = newCode;
      result.$aurelia.waitForIdle();
      expect(vm.code).toBe(newCode);
      expect(vm.lineNumbersCount).toBe(1);

      expect(result.textContent.indexOf(newCode) !== -1).toBe(true);
    });
  });
});
