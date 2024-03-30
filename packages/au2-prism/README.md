[![npm version](https://img.shields.io/npm/v/@aegenet/au2-prism.svg)](https://www.npmjs.com/package/@aegenet/au2-prism)
<br>

# @aegenet/au2-prism

> Aurelia 2 component: Prism & Prism Editor.

> *Fork of Prism Editor: https://github.com/koca/vue-prism-editor*

> Missing a lot of tests in our implementation! (see: https://github.com/koca/vue-prism-editor/blob/master/packages/vue-prism-editor/tests/Editor.spec.ts for base of tests)

# Installation

```shell
npm install @aegenet/au2-prism@^1.6.1
# or
yarn add @aegenet/au2-prism@^1.6.1
```

# Usage

## Register the plugin

```js
import * as myPlugin from '@aegenet/au2-prism';
Aurelia
  // Load all exports from the plugin
  .register(myPlugin)
  .app(MyApp)
  .start();
```

## Components usage

### Prism View

```html
<prism-view code="const myVar = { code: 'quantum', title: 'Unknown', where: 'Who know' };" language="javascript"></prism-view>
```

### Prism Editor

```html
<prism-editor code="const myVar = { code: 'quantum', title: 'Unknown', where: 'Who know' };" language="javascript"></prism-editor>
```

### Example

```html
<h2>Prism Editor</h2>
<prism-editor component.ref="prismRef" code="const myVar = { code: 'quantum', title: 'Unknown', where: 'Who know' };" language="javascript"></prism-editor>

<button click.trigger="prismRef.code = 'Ok ok'">Change!</button>

<h2>Value</h2>
<pre><code innerhtml.bind="prismRef.code"></code></pre>

<h2>Prism View</h2>
<prism-view code.bind="prismRef.code" language="javascript"></prism-view>
```

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
