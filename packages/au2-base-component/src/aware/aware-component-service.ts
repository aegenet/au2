import { type Controller, IEventAggregator, inject } from 'aurelia';
import type { IAwareComponentService } from './i-aware-component-service';
import type { IAwareEvent } from './i-aware-event';
import type { ICustomElementAware } from './i-custom-element-aware';

@inject(IEventAggregator)
export class AwareComponentService implements IAwareComponentService {
  private static readonly _RE_PROPERTY_CHECK = /^[a-z]/i;

  constructor(private readonly _ev: IEventAggregator) {
    //
  }

  /**
   * @inheritdoc
   */
  public subscribe(customElement: ICustomElementAware & { $controller?: Controller }) {
    if (customElement.eventName && customElement.$controller?.definition) {
      const definition = customElement.$controller.definition;
      if (definition.name) {
        customElement.$awareToken = this._ev.subscribe(`${definition.name}:${customElement.eventName}`, (options: IAwareEvent) => {
          this.publish(customElement, options);
        });
      }
    }
  }

  /**
   * @inheritdoc
   */
  public publish(customElement: ICustomElementAware, options: IAwareEvent) {
    // Ensure property begins with an alpha character
    if (options?.property && AwareComponentService._RE_PROPERTY_CHECK.test(options.property) && options.property in customElement) {
      const descriptor = Object.getOwnPropertyDescriptor(customElement, options.property);
      if (descriptor) {
        // Properties has descriptor (function don't have)
        if (descriptor.set || descriptor.get) {
          // La propriété a un getter/setter, nous l'utilisons
          if (descriptor.set) {
            // Nous faisons seulement quelque chose si le setter existe
            customElement[options.property] = options.value;
          }
        } else if (descriptor.value instanceof Function) {
          (descriptor.value as () => void).apply(customElement, options.value);
        } else {
          customElement[options.property] = options.value;
        }
      } else if (customElement[options.property] instanceof Function) {
        debugger;
        (customElement[options.property] as () => void).apply(customElement, options.value);
      }
    }
  }

  /**
   * @inheritdoc
   */
  public unsubscribe(customElement: ICustomElementAware) {
    if (customElement.$awareToken) {
      customElement.$awareToken.dispose();
      customElement.$awareToken = undefined;
    }
  }
}
