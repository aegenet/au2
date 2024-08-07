import { rollupDTSConfigurator } from '@aegenet/yawt';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import aurelia from '@aurelia/vite-plugin';

export default rollupDTSConfigurator({
  cwd: dirname(fileURLToPath(import.meta.url)),
  libName: '@aegenet/au2-prism',
  entryPoint: 'src/index.ts',
  nodeExternal: true,
  plugins: [aurelia()],
});
