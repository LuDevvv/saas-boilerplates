import { create, StateCreator, StoreApi, UseBoundStore } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";

/**
 * Crea un store de Zustand con persistencia opcional
 * @param initializer La función que inicializa el estado del store
 * @param persistOptions Opciones para persistir el estado del store
 * @returns Un store de Zustand
 */
export function createStore<T>(
  initializer: StateCreator<T>,
  persistOptions?: Omit<PersistOptions<T>, "partialize"> & {
    partialize?: (state: T) => Partial<T>;
  }
): UseBoundStore<StoreApi<T>> {
  if (persistOptions) {
    return create<T>()(
      persist(initializer, persistOptions as PersistOptions<T>)
    );
  }

  return create<T>(initializer);
}
