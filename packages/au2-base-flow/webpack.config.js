/* eslint-disable @typescript-eslint/no-var-requires */
const nodeExternals = require('webpack-node-externals');
const configuratorNode = require('./../../.build/webpack.node.configurator');

module.exports = [
  configuratorNode({
    org: 'aegenet',
    name: 'au2-base-flow',
    directory: __dirname,
    target: 'node16',
    subdir: 'node',
    libraryType: 'module',
    externals: [nodeExternals({})],
  }),
  configuratorNode({
    org: 'aegenet',
    name: 'au2-base-flow',
    directory: __dirname,
    target: 'es2017',
    subdir: 'web',
    libraryType: 'module',
    externals: [nodeExternals({})],
  }),
];
