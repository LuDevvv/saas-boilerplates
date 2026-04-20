import { UseQueryResult } from "@tanstack/react-query";
import { normalizeList, extractTotal } from "@/lib/data";

/**
 * Utilidad global para hooks de listas (plural).
 * Automatiza el desempaquetado de datos paginados y metadatos.
 */
export function useListQuery<T>(query: UseQueryResult<any>) {
  const items = normalizeList<T>(query.data);
  const total = extractTotal(query.data);

  return {
    ...query,
    items,
    total,
    isEmpty: items.length === 0,
  };
}
