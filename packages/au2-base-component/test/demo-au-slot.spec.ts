import { getViewModel, renderInDOM } from './helper';
import { DemoAuSlot } from '../dev-app/demo-au-slot';

describe('demo-au-slot', () => {
  it('Slots', async () => {
    await renderInDOM(
      `<demo-au-slot view-model.ref="demoComponent2">
      <span au-slot="one" title="French">
        <h5>Second slide label</h5>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </span>
      <span au-slot="two" title="English">
        <h5>Third slide label</h5>
        <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
      </span>
    </demo-au-slot>`,
      [DemoAuSlot],
      async result => {
        const vm = getViewModel<DemoAuSlot>(result);
        expect(vm.tabSlot).toBe('one');
        expect(vm.auSlotNames.length).toBe(2);
        expect(vm.auSlotNames[0]).toBe('one');
        expect(vm.auSlotNames[1]).toBe('two');
        await vm.dispose();
        expect(vm.auSlotNames.length).toBe(0);
      }
    );
  });

  it('next tab', async () => {
    await renderInDOM(
      `<demo-au-slot view-model.ref="demoComponent2">
      <span au-slot="one" title="French">
        <h5>Second slide label</h5>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </span>
      <span au-slot="two" title="English">
        <h5>Third slide label</h5>
        <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
      </span>
    </demo-au-slot>`,
      [DemoAuSlot],
      async result => {
        const vm = getViewModel<DemoAuSlot>(result);
        expect(vm.auSlotNames.length).toBe(2);
        expect(vm.auSlotNames[0]).toBe('one');
        expect(vm.auSlotNames[1]).toBe('two');

        expect(vm.tabSlot).toBe(vm.auSlotNames[0]);
        await vm.dispose();
        expect(vm.auSlotNames.length).toBe(0);
      }
    );
  });
});
