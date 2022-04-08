import { getViewModel, renderInDOM } from './helper';
import { DemoComponent } from '../dev-app/demo-component';

describe('demo-component', () => {
  it('Slots', async () => {
    await renderInDOM(
      `<demo-component view-model.ref="demoComponent">
    <span slot="one" title="French">
      <h5>Second slide label</h5>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </span>
    <span slot="two" title="English">
      <h5>Third slide label</h5>
      <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
    </span>
  </demo-component>`,
      [DemoComponent],
      async result => {
        const vm = getViewModel<DemoComponent>(result);
        expect(vm.tabSlot).toBe('one');
        expect(vm.slotNames.length).toBe(2);
        expect(vm.slotNames[0]).toBe('one');
        expect(vm.slotNames[1]).toBe('two');
        expect(Object.keys(vm.slots).length).toBe(2);
        expect(vm.slots.one).toBeTruthy();
        expect(vm.slots.two).toBeTruthy();

        await vm.dispose();
        expect(vm.slotNames.length).toBe(0);
        // expect(Object.keys(vm.slots).length).toBe(0);
      }
    );
  });

  it('next tab', async () => {
    await renderInDOM(
      `<demo-component view-model.ref="demoComponent">
    <span slot="one" title="French">
      <h5>Second slide label</h5>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </span>
    <span slot="two" title="English">
      <h5>Third slide label</h5>
      <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
    </span>
  </demo-component>`,
      [DemoComponent],
      async result => {
        const vm = getViewModel<DemoComponent>(result);
        expect(vm.slotNames.length).toBe(2);
        expect(vm.slotNames[0]).toBe('one');
        expect(vm.slotNames[1]).toBe('two');

        expect(Object.keys(vm.slots).length).toBe(2);
        expect(vm.slots.one).toBeTruthy();
        expect(vm.slots.two).toBeTruthy();

        expect(vm.tabSlot).toBe(vm.slotNames[0]);
        vm.select(vm.slotNames[1]);
        await result.$aurelia.waitForIdle();
        expect(vm.tabSlot).toBe(vm.slotNames[1]);
        await vm.dispose();
        expect(vm.slotNames.length).toBe(0);
        // expect(Object.keys(vm.slots).length).toBe(0);
      }
    );
  });
});
