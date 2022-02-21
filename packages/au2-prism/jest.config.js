/* eslint-disable @typescript-eslint/no-var-requires */
const configurator = require('../../.build/jest.web.configurator');

module.exports = configurator({
  /** Si nous sommes entrain de builder tous les projets nous voulons mettre les coverages aux mêmes endroits, sinon, c'est par projet */
  directory: __dirname,
});
