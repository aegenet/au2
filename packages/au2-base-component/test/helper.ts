import Aurelia, { CustomElement } from 'aurelia';

async function _renderDiv(div: HTMLElement, componentOrTemplate: string | unknown, ...deps: readonly unknown[]) {
  const wrapper = typeof componentOrTemplate === 'string' ? CustomElement.define({ name: 'wrapper', template: componentOrTemplate }) : componentOrTemplate;

  const au = new Aurelia().register(...deps).app({
    host: div,
    component: wrapper,
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
export async function renderInDOM(componentOrTemplate: string | unknown, deps: readonly unknown[], action: (result: HTMLElement & { $aurelia?: Aurelia }, innerHTML: string) => Promise<void>): Promise<void> {
  const div = document.createElement('div');
  try {
    document.body.appendChild(div);

    const au = await _renderDiv(div, componentOrTemplate, ...deps);

    await action(div, div.innerHTML);
    await au.stop();
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
export function getViewModel<T>(result: HTMLElement, propertyName?: string): T {
  const baseChildren = result['$au']['au:resource:custom-element'].children;
  const vm = baseChildren ? baseChildren[0].scope.bindingContext : undefined;

  if (vm && propertyName?.length) {
    return vm[propertyName];
  } else {
    return vm;
  }
}