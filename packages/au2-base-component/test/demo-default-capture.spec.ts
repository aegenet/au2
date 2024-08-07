/**
 * @vitest-environment jsdom
 */
import { getViewModel, renderInDOM } from './helper';
import { DemoDefaultCapture } from '../dev-app/demo-default-capture';

describe('demo-default-capture', () => {
  it('Slots', async () => {
    await renderInDOM(
      `<demo-default-capture component.ref="demoDefaultCapture">
      Click me
  </demo-default-capture>`,
      [DemoDefaultCapture],
      async result => {
        const vm = getViewModel<DemoDefaultCapture>(result);
        expect(vm.clickCount).toBe(0);
        (result!.firstElementChild!.firstElementChild as HTMLButtonElement).click();
        expect(vm.clickCount).toBe(1);

        await vm.unbinding();
      }
    );
  });
});
