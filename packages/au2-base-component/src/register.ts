import { type IContainer, Registration } from 'aurelia';
import { AwareComponentService } from './aware/aware-component-service';
import { DIAwareComponentService } from './aware/i-aware-component-service';

/** Register the plugin */
export function register() {
  return {
    register: (container: IContainer) => {
      container.register(Registration.singleton(DIAwareComponentService, AwareComponentService));
    },
  };
}
