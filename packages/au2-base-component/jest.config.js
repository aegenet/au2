/* eslint-disable @typescript-eslint/no-var-requires */
const configurator = require('../../.build/jest.web.configurator');
const path = require('path');

module.exports = configurator({
  /** Si nous sommes entrain de builder tous les projets nous voulons mettre les coverages aux mêmes endroits, sinon, c'est par projet */
  directory: __dirname,
  moduleNameMapper: {
    '@aegenet/belt-(.*)': path.join(__dirname, 'node_modules', '@aegenet', 'belt-$1'),
    '@aegenet/(.*)': path.join(__dirname, '..', '$1', 'src'),
  },
});
