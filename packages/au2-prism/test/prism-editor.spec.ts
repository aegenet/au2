/**
 * @vitest-environment jsdom
 */
import { getViewModel, renderInDOM } from './helper';
import { PrismEditor } from '../src/index';

describe('prism-editor', () => {
  it('should render empty', async () => {
    await renderInDOM('<prism-editor></prism-editor>', [PrismEditor], async result => {
      expect(result.textContent?.trim()).toBe('');
    });
  });

  it('should render null', async () => {
    await renderInDOM('<prism-editor code.bind="null"></prism-editor>', [PrismEditor], async result => {
      expect(result.textContent?.trim()).toBe('');
    });
  });

  it('should render code', async () => {
    await renderInDOM('<prism-editor code="foo"></prism-editor>', [PrismEditor], async result => {
      expect(result.textContent?.indexOf('foo') !== -1).toBe(true);
    });
  });

  it('should render code with language', async () => {
    const code = "const sample = { code: 'oh' };";
    await renderInDOM(
      `<prism-editor code="${code}" language="javascript"></prism-editor>`,
      [PrismEditor],
      async result => {
        expect(result.textContent?.indexOf(code) !== -1).toBe(true);
      }
    );
  });

  it('should render code modification', async () => {
    const code = "const sample = { code: 'oh' };";
    const newCode = "const yes = 'yes';";
    await renderInDOM(
      `<prism-editor code="${code}" language="javascript"></prism-editor>`,
      [PrismEditor],
      async result => {
        expect(result.textContent?.indexOf(code) !== -1).toBe(true);
        const vm = getViewModel<PrismEditor>(result);
        expect(vm.code).toBe(code);
        vm.code = newCode;
        await result.$aurelia?.waitForIdle();
        expect(vm.code).toBe(newCode);

        expect(result.textContent?.indexOf(newCode) !== -1).toBe(true);
      }
    );
  });

  it('should render lineNumbers', async () => {
    const code = "const sample = { code: 'oh' };\nconst tata = { ha: 'hoh' };";
    const newCode = "const yes = 'yes';";
    await renderInDOM(
      `<prism-editor line-numbers.bind="true" code="${code}" language="javascript"></prism-editor>`,
      [PrismEditor],
      async result => {
        expect(result.textContent?.indexOf(code) !== -1).toBe(true);
        const vm = getViewModel<PrismEditor>(result);
        expect(vm.code).toBe(code);
        expect(vm.lineNumbersCount).toBe(2);

        vm.code = newCode;
        await result.$aurelia?.waitForIdle();
        expect(vm.code).toBe(newCode);
        expect(vm.lineNumbersCount).toBe(1);

        expect(result.textContent?.indexOf(newCode) !== -1).toBe(true);
      }
    );
  });

  it('lineNumbers changed', async () => {
    const code = "const sample = { code: 'oh' };\nconst tata = { ha: 'hoh' };";
    const newCode = "const yes = 'yes';";
    await renderInDOM(
      `<prism-editor component.ref="prismVM" line-numbers.bind="false" code="${code}" language="javascript"></prism-editor>`,
      [PrismEditor],
      async result => {
        expect(result.textContent?.indexOf(code) !== -1).toBe(true);
        const vm = getViewModel<PrismEditor>(result, {
          ref: 'prismVM',
        });
        expect(vm.code).toBe(code);
        expect(vm.lineNumbers).toBe(false);
        expect(vm.lineNumbersCount).toBe(2);

        vm.code = newCode;
        await result.$aurelia?.waitForIdle();
        expect(vm.code).toBe(newCode);
        expect(vm.lineNumbersCount).toBe(1);

        expect(result.textContent?.indexOf(newCode) !== -1).toBe(true);

        vm.lineNumbers = true;
        await result.$aurelia?.waitForIdle();
        expect(vm.lineNumbers).toBe(true);
      }
    );
  });

  // it('Undo', async () => {
  //   const code = "const sample = { code: 'oh' };\nconst tata = { ha: 'hoh' };";
  //   const newCode = "const yes = 'yes';";
  //   await renderInDOM(`<prism-editor component.ref="prismVM" line-numbers.bind="true" code="${code}" language="javascript"></prism-editor>`, [PrismEditor], async result => {
  //     expect(result.textContent?.indexOf(code) !== -1).toBe(true);
  //     const vm = getViewModel<PrismEditor>(result, {
  //       ref: 'prismVM',
  //     });
  //     expect(vm.code).toBe(code);
  //     expect(vm.lineNumbers).toBe(true);
  //     expect(vm.lineNumbersCount).toBe(2);

  //     vm.code = newCode;
  //     await result.$aurelia?.waitForIdle();
  //     expect(vm.code).toBe(newCode);
  //     expect(vm.lineNumbersCount).toBe(1);

  //     expect(result.textContent?.indexOf(newCode) !== -1).toBe(true);

  //     vm.undo();
  //     await result.$aurelia?.waitForIdle();

  //     expect(vm.code).toBe(code);
  //     expect(vm.lineNumbers).toBe(true);
  //     expect(vm.lineNumbersCount).toBe(2);
  //   });
  // });
});
