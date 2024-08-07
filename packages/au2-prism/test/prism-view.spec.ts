/**
 * @vitest-environment jsdom
 */
import { getViewModel, renderInDOM } from './helper';
import { PrismView } from '../src/index';

describe('prism-view', () => {
  it('should render code', async () => {
    await renderInDOM('<prism-view code="foo"></prism-view>', [PrismView], async result => {
      expect(result.textContent?.indexOf('foo') !== -1).toBe(true);
    });
  });

  it('should render code with language', async () => {
    const code = "const sample = { code: 'oh' };";
    await renderInDOM(`<prism-view code="${code}" language="javascript"></prism-view>`, [PrismView], async result => {
      expect(result.textContent?.indexOf(code) !== -1).toBe(true);
    });
  });

  it('should render code modification', async () => {
    const code = "const sample = { code: 'oh' };";
    const newCode = "const yes = 'yes';";
    await renderInDOM(`<prism-view code="${code}" language="javascript"></prism-view>`, [PrismView], async result => {
      expect(result.textContent?.indexOf(code) !== -1).toBe(true);
      const vm = getViewModel<PrismView>(result);
      expect(vm.code).toBe(code);
      vm.code = newCode;
      await result.$aurelia?.waitForIdle();
      expect(vm.code).toBe(newCode);
      expect(result.textContent?.indexOf(newCode) !== -1).toBe(true);
    });
  });
});
