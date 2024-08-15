[![npm version](https://img.shields.io/npm/v/@aegenet/au2-code-mirror.svg)](https://www.npmjs.com/package/@aegenet/au2-code-mirror)
<br>

# @aegenet/au2-code-mirror

> *DRAFT* Aurelia 2 component: CodeMirror 6+.

> Tested with [`Aurelia v2.0.0-beta.21`](https://github.com/aurelia/aurelia/releases/tag/v2.0.0-beta.21).

# Installation

```shell
npm install @aegenet/au2-code-mirror@^2.0.0
# or
yarn add @aegenet/au2-code-mirror@^2.0.0
```

# Usage

## Register the plugin

```js
import * as myPlugin from '@aegenet/au2-code-mirror';
Aurelia
  // Load all exports from the plugin
  .register(myPlugin)
  .app(MyApp)
  .start();
```

## Component usage

```html
<code-mirror code="const myVar = { code: 'quantum', title: 'Unknown', where: 'Who know' };" language="javascript"></code-mirror>
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
