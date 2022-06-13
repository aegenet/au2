/* eslint-disable @typescript-eslint/no-var-requires */
const configurator = require('../../.build/webpack.plugin.configurator');

module.exports = configurator({
  org: 'aegenet',
  name: 'au2-code-mirror',
  directory: __dirname,
  target: 'es2017',
  libraryType: 'module',
});
