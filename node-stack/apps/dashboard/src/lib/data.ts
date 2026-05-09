/**
 * Normaliza cualquier respuesta de lista del backend (paginada o plana).
 * Devuelve siempre el array de elementos.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeList<T>(response: any): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  
  // Buscar en claves comunes de respuesta
  return response.data || response.paymentMethods || response.results || [];
}

/**
 * Extrae el total de cualquier respuesta de lista.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractTotal(response: any): number {
  if (!response) return 0;
  if (Array.isArray(response)) return response.length;
  return response.total ?? response.meta?.total ?? 0;
}
