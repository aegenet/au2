import { Platform } from '@aurelia/kernel';

export function raPlatform() {
  return Platform.getOrCreate<
    {
      console?: {
        log: (...args: unknown[]) => void;
      };
    } & typeof globalThis
  >(globalThis);
}
