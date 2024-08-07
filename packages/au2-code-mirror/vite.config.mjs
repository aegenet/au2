import { viteConfigurator } from '@aegenet/yawt';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import aurelia from '@aurelia/vite-plugin';
import { env } from 'node:process';

const isDev = env.NODE_ENV !== 'production';

export default viteConfigurator({
  cwd: dirname(fileURLToPath(import.meta.url)),
  libName: '@aegenet/au2-code-mirror',
  entryPoint: 'src/index.ts',
  nodeExternal: true,
  plugins: [aurelia()],
  viteOptions: {
    esbuild: {
      target: 'es2022',
    },
    define: {
      __DEV__: JSON.stringify(isDev),
    },
  },
});
