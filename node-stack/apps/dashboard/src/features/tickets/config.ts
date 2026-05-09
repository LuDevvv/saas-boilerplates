import type { TicketStatus, TicketPriority } from "@node-stack/types";
import type { StatusPillTone } from "@node-stack/ui";

type Tone = StatusPillTone;

export const priorityConfig: Record<
  TicketPriority,
  { label: string; tone: Tone; chip: string }
> = {
  low: {
    label: "Baja",
    tone: "neutral",
    chip: "bg-surface-hover text-fg-muted border-border",
  },
  medium: {
    label: "Media",
    tone: "info",
    chip: "bg-primary/10 text-primary border-primary/20",
  },
  high: {
    label: "Alta",
    tone: "warning",
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  critical: {
    label: "Crítica",
    tone: "danger",
    chip: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
};

export const statusConfig: Record<
  TicketStatus,
  { label: string; tone: Tone; dotColor: string }
> = {
  open:        { label: "Abierto",      tone: "info",    dotColor: "bg-primary" },
  in_progress: { label: "En progreso",  tone: "warning", dotColor: "bg-amber-500" },
  resolved:    { label: "Resuelto",     tone: "success", dotColor: "bg-emerald-500" },
  closed:      { label: "Cerrado",      tone: "neutral", dotColor: "bg-fg-muted" },
};

export const statusTabs: { key: TicketStatus | "all"; label: string }[] = [
  { key: "all",         label: "Todos" },
  { key: "open",        label: "Abiertos" },
  { key: "in_progress", label: "En progreso" },
  { key: "resolved",    label: "Resueltos" },
  { key: "closed",      label: "Cerrados" },
];

// ─── Kanban columns ──────────────────────────────────────────────────────────

export const kanbanColumns: { key: TicketStatus; label: string; description: string }[] = [
  { key: "open",        label: "Backlog",     description: "Sin tomar" },
  { key: "in_progress", label: "En progreso", description: "Activos" },
  { key: "resolved",    label: "Resueltos",   description: "Por validar" },
  { key: "closed",      label: "Cerrados",    description: "Completados" },
];
