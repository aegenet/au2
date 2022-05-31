import { Platform } from '@aurelia/platform';

export function raPlatform() {
  return Platform.getOrCreate<
    {
      console?: {
        log: (...args: unknown[]) => void;
      };
    } & typeof globalThis
  >(globalThis);
}
