import "reflect-metadata";

export interface RateLimitOptions {
  max: number;
  windowMs: number;
  key?: "user" | "ip" | "route";
}

const RATE_LIMIT_METADATA = "cache:rate-limit";

export function RateLimit(options: RateLimitOptions) {
  return function (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const fn = descriptor.value as unknown as Function;
    Reflect.defineMetadata(RATE_LIMIT_METADATA, options, fn);
  };
}

export function getRateLimitOptions(
  fn: Function,
): RateLimitOptions | undefined {
  return Reflect.getMetadata(RATE_LIMIT_METADATA, fn);
}
