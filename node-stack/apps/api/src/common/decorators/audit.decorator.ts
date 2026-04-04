import "reflect-metadata";

export function AuditLog(event?: string) {
  return function (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const fn = descriptor.value as unknown as Function;
    Reflect.defineMetadata("audit", event ?? true, fn);
  };
}
