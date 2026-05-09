import { UseQueryResult } from "@tanstack/react-query";

import { normalizeList, extractTotal } from "@/lib/data";

/**
 * Utilidad global para hooks de listas (plural).
 * Automatiza el desempaquetado de datos paginados y metadatos.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
