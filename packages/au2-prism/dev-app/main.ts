import Aurelia /*, StyleConfiguration*/ from 'aurelia';
import { MyApp } from './my-app';
// Css files imported in this main file are NOT processed by style-loader
// They are for sharedStyles in shadowDOM.
// However, css files imported in other js/ts files are processed by style-loader.
// import shared from './shared.scss';
import * as Plugin from '../src/index';

Promise.resolve(
  Aurelia
    /*
  .register(StyleConfiguration.shadowDOM({
    // optionally add the shared styles for all components
    sharedStyles: [shared]
  }))
  */
    // Register all exports of the plugin
    .register(Plugin)
    .app(MyApp)
    .start()
).catch(console.error);
