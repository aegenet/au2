[![npm version](https://img.shields.io/npm/v/@aegenet/au2-base-component.svg)](https://www.npmjs.com/package/@aegenet/au2-base-component)
<br>

# @aegenet/au2-base-component

> `BaseComponent` with `EventAggregator`, `I18N`, `Aware Event` and `AntiBounce`
> `BasePage` with `EventAggregator`, `I18N`, `Aware Event` and `AntiBounce`


# Installation

```shell
npm install @aegenet/au2-base-component@^1.6.1
# or
yarn add @aegenet/au2-base-component@^1.6.1
```

# Usage

## Register the plugin

```js
import * as myPlugin from '@aegenet/au2-base-component';
Aurelia
  // Load all exports from the plugin
  .register(myPlugin)
  .app(MyApp)
  .start();
```

## Components & services

### BaseComponent

A base component adds the following features to a component:
- `EventAggregator` to send and receive events.
- `I18N` to translate the page.
- `Aware` to listen to events from other components.
- `AntiBounce` to prevent multiple clicks on a button.
- `Store` to store data in memory.
- `Slots` informations to manage slots.

```typescript
import { customElement, IContainer, inject } from 'aurelia';
import { BaseComponent } from '@aegenet/au2-base-component';

import template from './demo-component.html';
@customElement({
  name: 'demo-component',
  template,
})
@inject(Element, IContainer)
export class DemoComponent extends BaseComponent {
  //
}
```

### BasePage

A base page adds the following features to a page component:
- `Router` to navigate between pages.
- `EventAggregator` to send and receive events.
- `I18N` to translate the page.
- `Aware` to listen to events from other components.
- `AntiBounce` to prevent multiple clicks on a button.
- `Store` to store data in memory.

```typescript
import { IContainer, customElement, inject } from 'aurelia';
import { BasePage } from '@aegenet/au2-base-component';

import template from './demo-page.html';
@customElement({
  name: 'demo-page',
  template,
})
@inject(IContainer)
export class DemoPage extends BasePage {
  //
}
```

### Aware

When a component inherits from `BaseComponent`, it can be controlled by events.

From TypeScript: with a simple `IEventAggregator`, you can send events to the component.

```typescript
import { IEventAggregator } from 'aurelia';
// [...]

const ev: IEventAggregator = container.get(IEventAggregator);
ev.publish('demo-component:tab1', { property: 'select', value: ['two'] });
```

From HTML: with the `aware-component` custom element, you can send events to the component.

```html
<demo-component component.ref="demoComponent" event-name="tab1">
  <span slot="one" title="French">
    <h5>Second slide label</h5>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
  </span>
  <span slot="two" title="English">
    <h5>Third slide label</h5>
    <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
  </span>
</demo-component>

<aware-component component.ref="awareBtnRef" events.bind="[{ name: 'demo-component:tab1', options: { property: 'select', value: ['two'] } }]"></aware-component>

<button click.trigger="awareBtnRef.publish()">Send event</button>
```

### Store

This basic store is more like a cache system. It allows you to store data in memory and refresh it when needed.

```typescript
import { DIStoreService, IStoreService } from '@aegenet/au2-base-component';

const storeService = container.get<IStoreService>(DIStoreService);

// Setup
storeService.setStore({
  key: 'user',
  async load(container) {
      return JSON.parse(localStorage.getItem('user') || '[]');
  },
}, {
  key: 'user_index',
  async load(container) {
      return arrayToObject((await storeService.getStore('user')) as unknown[], 'id');
  },
});

// [...]

// Get
await storeService.getStore('user'); // []

// Set
localStorage.setItem('user', JSON.stringify([{ id: 1, name: 'John' }]));
// Refresh
await storeService.refreshStore('user');

// Get
await storeService.getStore('user'); // [{ id: 1, name: 'John' }];
```

### Container stats & debug

```typescript
import { debugContainer } from '@aegenet/au2-base-component';
debugContainer(null);
/* {
    instance: [],
    singleton: [],
    transient: [],
    callback: [],
    array: [],
    alias: [],
} */

// container: IContainer;
debugContainer(container);
```

### Default capture

```html
<button 
  ...$attrs
  type="button"
  click.trigger="doAction()"
  <au-slot>
  </au-slot>
</button>
```

```typescript
import { customElement, IContainer, inject } from 'aurelia';
import { defaultCapture, BaseComponent } from '../src';
import template from './demo-default-capture.html';

/**
 * Demo default capture
 */
@customElement({
  name: 'demo-default-capture',
  template,
  capture: defaultCapture,
})
@inject(Element, IContainer)
export class DemoDefaultCapture extends BaseComponent {
  public clickCount: number = 0;

  constructor(element: Element, container: IContainer) {
    super(element, container);
  }

  public doAction(): void {
    this.clickCount++;
  }
}
````

# Development

## Start dev web server

    npm start

Note this plugin project comes with a dev-app. The above command starts the dev app in `dev-app/` folder. The plugin source code is in `src/` folder.

## Build the plugin in production modern

    npm run build

It builds plugin into `dist/index.mjs` file.

Note when you do `npm publish` or `npm pack` to prepare the plugin package, it automatically run the above build command by the `prepare` script defined in your package.json `"scripts"` section.

## Unit Tests

    npm run test

Run unit tests in watch mode.

    npm run test:watch


## Analyze webpack bundle

    npm run analyze

# License

[The MIT License](LICENSE) - Copyright © 2022-2024 [Alexandre Genet](https://github.com/aegenet).
