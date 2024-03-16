import { DemoComponent } from '../dev-app/demo-component';
import { AwareComponent } from '../src';
import { getViewModel, renderInDOM } from './helper';

describe('aware-component', () => {
  it('Event me by component', async () => {
    await renderInDOM(
      `<demo-component component.ref="demoComponent" event-name="tab1">
    <span slot="one" title="French">
      <h5>Second slide label</h5>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </span>
    <span slot="two" title="English">
      <h5>Third slide label</h5>
      <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
    </span>
  </demo-component>
  <aware-component component.ref="awareBtnRef" events.bind="[{ name: 'demo-component:tab1', options: { property: 'select', value: ['two'] } }]">Do it!</aware-component>`,
      [DemoComponent, AwareComponent],
      async result => {
        const vm = getViewModel<DemoComponent>(result, {
          ref: 'demoComponent',
        });
        const vmBtn = getViewModel<AwareComponent>(result, {
          ref: 'awareBtnRef',
        });
        expect(vm.slotNames.length).toBe(2);
        expect(vm.slotNames[0]).toBe('one');
        expect(vm.slotNames[1]).toBe('two');

        expect(Object.keys(vm.slots).length).toBe(2);
        expect(vm.slots.one).toBeTruthy();
        expect(vm.slots.two).toBeTruthy();

        expect(vm.tabSlot).toBe(vm.slotNames[0]);
        await vmBtn.publish();

        await result.$aurelia.waitForIdle();
        expect(vm.tabSlot).toBe(vm.slotNames[1]);
        await vm.unbinding();
        expect(vm.slotNames.length).toBe(0);
        // expect(Object.keys(vm.slots).length).toBe(0);
      }
    );
  });

  it('Event me by component - then', async () => {
    await renderInDOM(
      `<let something="My Div"></let><div ref="myDiv">\${something}</div><demo-component component.ref="demoComponent" event-name="tab1">
    <span slot="one" title="French">
      <h5>Second slide label</h5>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </span>
    <span slot="two" title="English">
      <h5>Third slide label</h5>
      <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
    </span>
  </demo-component>
  <aware-component component.ref="awareBtnRef" events.bind="[{ name: 'demo-component:tab1', options: { property: 'select', value: ['two'] } }]" next.bind="() => something = 'No!'">Do it!</aware-component>`,
      [DemoComponent, AwareComponent],
      async result => {
        const vm = getViewModel<DemoComponent>(result, {
          ref: 'demoComponent',
        });
        const myDiv: HTMLDivElement = getViewModel<HTMLDivElement>(result, {
          ref: 'myDiv',
        });
        const vmBtn = getViewModel<AwareComponent>(result, {
          ref: 'awareBtnRef',
        });
        expect(vm.slotNames.length).toBe(2);
        expect(vm.slotNames[0]).toBe('one');
        expect(vm.slotNames[1]).toBe('two');
        expect(myDiv.textContent).toBe('My Div');

        expect(Object.keys(vm.slots).length).toBe(2);
        expect(vm.slots.one).toBeTruthy();
        expect(vm.slots.two).toBeTruthy();

        expect(vm.tabSlot).toBe(vm.slotNames[0]);
        await vmBtn.publish();

        await result.$aurelia.waitForIdle();
        expect(myDiv.textContent).toBe('No!');
        expect(vm.tabSlot).toBe(vm.slotNames[1]);
        await vm.unbinding();
        expect(vm.slotNames.length).toBe(0);
        // expect(Object.keys(vm.slots).length).toBe(0);
      }
    );
  });

  it('Event me with specified namespace', async () => {
    await renderInDOM(
      `<let something="My Div"></let><div ref="myDiv">\${something}</div><demo-component component.ref="demoComponent" event-name="demo:tab1">
    <span slot="one" title="French">
      <h5>Second slide label</h5>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </span>
    <span slot="two" title="English">
      <h5>Third slide label</h5>
      <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
    </span>
  </demo-component>
  <aware-component component.ref="awareBtnRef" events.bind="[{ name: 'demo:tab1', options: { property: 'select', value: ['two'] } }]" next.bind="() => something = 'No!'">Do it!</aware-component>`,
      [DemoComponent, AwareComponent],
      async result => {
        const vm = getViewModel<DemoComponent>(result, {
          ref: 'demoComponent',
        });
        const myDiv: HTMLDivElement = getViewModel<HTMLDivElement>(result, {
          ref: 'myDiv',
        });
        const vmBtn = getViewModel<AwareComponent>(result, {
          ref: 'awareBtnRef',
        });
        expect(vm.slotNames.length).toBe(2);
        expect(vm.slotNames[0]).toBe('one');
        expect(vm.slotNames[1]).toBe('two');
        expect(myDiv.textContent).toBe('My Div');

        expect(Object.keys(vm.slots).length).toBe(2);
        expect(vm.slots.one).toBeTruthy();
        expect(vm.slots.two).toBeTruthy();

        expect(vm.tabSlot).toBe(vm.slotNames[0]);
        await vmBtn.publish();

        await result.$aurelia.waitForIdle();
        expect(myDiv.textContent).toBe('No!');
        expect(vm.tabSlot).toBe(vm.slotNames[1]);
        await vm.unbinding();
        expect(vm.slotNames.length).toBe(0);
        // expect(Object.keys(vm.slots).length).toBe(0);
      }
    );
  });
});
