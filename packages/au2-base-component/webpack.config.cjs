/* eslint-disable @typescript-eslint/no-var-requires */
const configurator = require('../../.build/webpack.plugin.configurator');

module.exports = [
  configurator({
    org: 'aegenet',
    name: 'au2-base-component',
    directory: __dirname,
    target: 'es2017',
    libraryType: 'module',
  }),
];
