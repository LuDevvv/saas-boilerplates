/**
 * Formatea una cadena de fecha o timestamp en una cadena de fecha localizada en español.
 * Ejemplo: "12 de diciembre de 2025"
 */
export const formatDateToSpanish = (
  date: string | number | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  }
): string => {
  if (!date) return "";

  const dateObj = new Date(date);

  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) return "";

  return new Intl.DateTimeFormat("es-MX", options).format(dateObj);
};

/**
 * Analiza una cadena de fecha y devuelve la cadena formateada en español.
 */
export const getFormattedDate = (dateString: string): string => {
  return formatDateToSpanish(dateString);
};
