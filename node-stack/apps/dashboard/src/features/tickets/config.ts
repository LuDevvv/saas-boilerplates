import type { TicketStatus, TicketPriority } from "@node-stack/types";

export const priorityConfig: Record<TicketPriority, { label: string; color: string; bg: string }> = {
  low: { label: "BAJA", color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800" },
  medium: { label: "MEDIA", color: "text-primary", bg: "bg-primary/10 dark:bg-primary/20" },
  high: { label: "ALTA", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
  critical: { label: "CRÍTICA", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
};

export const statusConfig: Record<TicketStatus, { label: string; dot: string; color: string }> = {
  open: { label: "Abierto", dot: "bg-primary", color: "text-primary" },
  in_progress: { label: "En progreso", dot: "bg-amber-500", color: "text-amber-600" },
  resolved: { label: "Resuelto", dot: "bg-teal-500", color: "text-teal-600" },
  closed: { label: "Cerrado", dot: "bg-gray-400", color: "text-gray-500" },
};

export const statusTabs: { key: TicketStatus | "all"; label: string }[] = [
  { key: "all", label: "TODOS" },
  { key: "open", label: "ABIERTOS" },
  { key: "in_progress", label: "PROGRESO" },
  { key: "resolved", label: "RESUELTOS" },
  { key: "closed", label: "CERRADOS" },
];
