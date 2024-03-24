# @aegenet/au2-code-mirror

> *DRAFT* Aurelia 2 component: CodeMirror 6+.


This project is bootstrapped by [aurelia/new](https://github.com/aurelia/new).

## Start dev web server

    npm start

Note this plugin project comes with a dev-app. The above command starts the dev app in `dev-app/` folder. The plugin source code is in `src/` folder.

## Build the plugin in production modern

    npm run build

It builds plugin into `dist/index.mjs` file.

Note when you do `npm publish` or `npm pack` to prepare the plugin package, it automatically run the above build command by the `prepare` script defined in your package.json `"scripts"` section.

## Consume the plugin

If your plugin is published to npm or a private registry, just install the plugin package.json

    npm install @aegenet/au2-code-mirror@^1.6.0

If you want to directly use plugin's git repo.

    npm install git@github.com:username/@aegenet/au2-code-mirror.git

or

    npm install https://some.git.server/username/@aegenet/au2-code-mirror.git

If you want to install from local folder, don't do "npm install ../local/@aegenet/au2-code-mirror/" as the folder's `node_modules/` will cause webpack to complain about duplicated dependency like "@aurelia/metadata".

In this plugin's folder, do

    npm pack

This will pack the plugin into @aegenet/au2-code-mirror
In an application project's main file.

```js
import * as myPlugin from '@aegenet/au2-code-mirror';
Aurelia
  // Load all exports from the plugin
  .register(myPlugin)
  .app(MyApp)
  .start();
```

## Unit Tests

    npm run test

Run unit tests in watch mode.

    npm run test:watch


## Analyze webpack bundle

    npm run analyze

# License

[The MIT License](LICENSE) - Copyright © 2022-2024 [Alexandre Genet](https://github.com/aegenet).
