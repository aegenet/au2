/* eslint-disable @typescript-eslint/no-var-requires */
import configurator from '../../.build/webpack.plugin.configurator.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default configurator({
  org: 'aegenet',
  name: 'au2-code-mirror',
  directory: __dirname,
  target: 'es2017',
  libraryType: 'module',
});
