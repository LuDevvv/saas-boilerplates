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

  if (isNaN(dateObj.getTime())) return "";

  return new Intl.DateTimeFormat("es-MX", options).format(dateObj);
};

export const getFormattedDate = (dateString: string): string => {
  return formatDateToSpanish(dateString);
};

export const formatRelativeTime = (date: string | number | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Hace un momento";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return formatDateToSpanish(date);
};

export const isToday = (date: string | number | Date): boolean => {
  const today = new Date();
  const target = new Date(date);
  return (
    today.getDate() === target.getDate() &&
    today.getMonth() === target.getMonth() &&
    today.getFullYear() === target.getFullYear()
  );
};

export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
};