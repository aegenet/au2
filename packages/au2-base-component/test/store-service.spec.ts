import { StoreComponent } from '../dev-app/store-component';
import { getViewModel, renderInDOM } from './helper';

describe('store-service', () => {
  it('Load from store', async () => {
    await renderInDOM(`<store-component component.ref="storeComponent"></store-component>`, [StoreComponent], async result => {
      const vm = getViewModel<StoreComponent>(result, {
        ref: 'storeComponent',
      });
      await result.$aurelia.waitForIdle();
      expect(vm.keys.length).toBe(3);
    });
  });
});
