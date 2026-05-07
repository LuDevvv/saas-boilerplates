/**
 * Formats a date string or Date object to a consistent "Day Month Year" format in Spanish.
 * Example: "27 Jan 2025" or "Oct 2023"
 */
export const formatDateShort = (date: string | Date | undefined | null, options?: Intl.DateTimeFormatOptions): string => {
  if (!date) return "Reciente";
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Default options for membership dates
  const defaultOptions: Intl.DateTimeFormatOptions = options || {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };

  try {
    return d.toLocaleDateString('es-ES', defaultOptions);
  } catch (e) {
    return "Reciente";
  }
};

/**
 * Formats a date to "Month Year" specifically for entities.
 * Example: "Oct 2023"
 */
export const formatEntityDate = (date: string | Date | undefined | null): string => {
  return formatDateShort(date, {
    month: 'short',
    year: 'numeric'
  });
};
