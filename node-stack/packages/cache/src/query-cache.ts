import { CacheService } from "./cache.service";

export interface CachedOptions {
  ttl?: number;
  namespace?: string;
}

export function Cached(options: CachedOptions = {}) {
  return function (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value as unknown as (
      ...args: unknown[]
    ) => unknown;
    descriptor.value = async function (...args: unknown[]) {
      const ns = options.namespace ?? "default";
      const cache = new CacheService(ns, options.ttl ?? 300);
      const className =
        (target as { constructor?: { name?: string } }).constructor?.name ??
        "Unknown";
      const key = `query:${className}.${String(propertyKey)}:${JSON.stringify(args)}`;
      const cached = await cache.get<unknown>(key);
      if (cached !== null && cached !== undefined) {
        return cached;
      }
      const result = await original.apply(this, args);
      await cache.set(key, result, options.ttl ?? 300);
      return result;
    };
  };
}
