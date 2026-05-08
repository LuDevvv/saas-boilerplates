import "reflect-metadata";

export interface RateLimitOptions {
  max: number;
  windowMs: number;
  key?: "user" | "ip" | "route";
}

const RATE_LIMIT_METADATA = "cache:rate-limit";

type DecoratorTarget = object;
type AnyFunction = (...args: unknown[]) => unknown;

export function RateLimit(
  options: RateLimitOptions,
): MethodDecorator {
  return function (
    _target: DecoratorTarget,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void {
    const fn = descriptor.value as AnyFunction;
    Reflect.defineMetadata(RATE_LIMIT_METADATA, options, fn);
  };
}

export function getRateLimitOptions(
  fn: AnyFunction,
): RateLimitOptions | undefined {
  return Reflect.getMetadata(RATE_LIMIT_METADATA, fn) as
    | RateLimitOptions
    | undefined;
}
