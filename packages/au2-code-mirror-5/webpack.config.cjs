/* eslint-disable @typescript-eslint/no-var-requires */
const configurator = require('../../.build/webpack.plugin.configurator');

module.exports = [
  configurator({
    org: 'aegenet',
    name: 'au2-code-mirror-5',
    directory: __dirname,
    target: 'es2017',
    libraryType: 'module',
  }),
  configurator({
    org: 'aegenet',
    name: 'au2-code-mirror-5',
    directory: __dirname,
    target: 'es2017',
    libraryType: 'commonjs',
  }),
];
