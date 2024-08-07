import Aurelia, { CustomElement } from 'aurelia';
import { register } from '../src';

async function _renderDiv(div: HTMLElement, componentOrTemplate: string | unknown, ...deps: readonly unknown[]) {
  const wrapper =
    typeof componentOrTemplate === 'string'
      ? CustomElement.define({ name: 'wrapper', template: componentOrTemplate })
      : componentOrTemplate;

  const au = new Aurelia().register(register(), ...deps).app({
    host: div,
    component: wrapper as object,
  });

  await au.start();
  await au.waitForIdle();
  return au;
}

/**
 * Contrairement à `render`, renderInDOM ajoute réellement l'élément dans le DOM.
 * Cela est obligatoire pour tester la visibilité par exemple
 * @param template
 * @param deps
 * @param action
 */
export async function renderInDOM(
  componentOrTemplate: string | unknown,
  deps: readonly unknown[],
  action: (result: HTMLElement & { $aurelia?: Aurelia }, innerHTML: string) => Promise<void>
): Promise<void> {
  const div = document.createElement('div');
  try {
    document.body.appendChild(div);

    const au = await _renderDiv(div, componentOrTemplate, ...deps);

    await action(div, div.innerHTML);
    await au.stop(true);
    await au.waitForIdle();
  } finally {
    if (div) {
      document.body.removeChild(div);
    }
  }
}

/**
 * Get ViewModel from HTMLElement
 * @param result
 * @returns
 */
export function getViewModel<T>(
  result: HTMLElement,
  options: {
    propertyName?: string;
    ref?: string;
  } = {}
): T {
  let vm: T;
  if (
    options.ref &&
    (result as Record<string, any>)['$au']['au:resource:custom-element'].viewModel &&
    options.ref in (result as Record<string, any>)['$au']['au:resource:custom-element'].viewModel
  ) {
    vm = (result as Record<string, any>)['$au']['au:resource:custom-element'].viewModel[options.ref];
  } else {
    const baseChildren = (result as Record<string, any>)['$au']['au:resource:custom-element'].children;
    vm = baseChildren ? baseChildren[0].scope.bindingContext : undefined;
  }

  if (vm && options.propertyName?.length) {
    return (vm as Record<string, unknown>)[options.propertyName] as T;
  } else {
    return vm;
  }
}
