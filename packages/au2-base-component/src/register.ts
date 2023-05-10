import { type IContainer, Registration } from 'aurelia';
import { AwareComponentService } from './aware/aware-component-service';
import { DIAwareComponentService } from './aware/i-aware-component-service';
import { DIStoreService } from './store/i-store-service';
import { StoreService } from './store/store-service';

/** Register the plugin */
export function register() {
  return {
    register: (container: IContainer) => {
      container.register(Registration.singleton(DIAwareComponentService, AwareComponentService));
      container.register(Registration.singleton(DIStoreService, StoreService));
    },
  };
}
