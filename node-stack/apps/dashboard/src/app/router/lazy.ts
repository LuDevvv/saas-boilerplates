import { lazy, LazyExoticComponent, ComponentType } from "react";

export const lazyRoute = <T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
): LazyExoticComponent<T> => lazy(factory);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lazyImport = (factory: () => Promise<any>) => lazy(factory);