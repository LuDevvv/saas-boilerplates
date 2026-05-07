import { useState, useCallback } from "react";
import {
  BarChart3,
  BookOpen,
  Zap,
  CheckSquare,
  Bell,
  type LucideIcon,
} from "lucide-react";

// ─── Widget catalog ───────────────────────────────────────────────────────────

export type WidgetId =
  | "quick-actions"
  | "stats"
  | "onboarding"
  | "novedades"
  | "guias";

export interface WidgetDef {
  id: WidgetId;
  label: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  defaultVisible: boolean;
}

export const WIDGET_CATALOG: WidgetDef[] = [
  {
    id: "quick-actions",
    label: "Acceso rápido",
    description: "Atajos a las secciones principales de la plataforma.",
    icon: Zap,
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    defaultVisible: true,
  },
  {
    id: "stats",
    label: "Resumen KPI",
    description: "Métricas clave de tu plataforma en tiempo real.",
    icon: BarChart3,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    defaultVisible: true,
  },
  {
    id: "onboarding",
    label: "Configuración",
    description: "Pasos pendientes para completar tu cuenta.",
    icon: CheckSquare,
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    defaultVisible: true,
  },
  {
    id: "novedades",
    label: "Novedades",
    description: "Últimas actualizaciones y mejoras de la plataforma.",
    icon: Bell,
    iconBg: "bg-violet-50 dark:bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    defaultVisible: true,
  },
  {
    id: "guias",
    label: "Guías",
    description: "Tutoriales y guías para sacar el máximo de la plataforma.",
    icon: BookOpen,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    defaultVisible: true,
  },
];

const DEFAULT_ORDER: WidgetId[] = WIDGET_CATALOG.map(w => w.id);
const VISIBILITY_KEY = "dashboard-layout-v4";
const ORDER_KEY      = "dashboard-order-v2";

function readVisibility(): Record<WidgetId, boolean> {
  try {
    const raw = localStorage.getItem(VISIBILITY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return Object.fromEntries(
    WIDGET_CATALOG.map(w => [w.id, w.defaultVisible])
  ) as Record<WidgetId, boolean>;
}

function readOrder(): WidgetId[] {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WidgetId[];
      const set = new Set(parsed);
      return [
        ...parsed.filter(id => DEFAULT_ORDER.includes(id)),
        ...DEFAULT_ORDER.filter(id => !set.has(id)),
      ];
    }
  } catch {}
  return [...DEFAULT_ORDER];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboardLayout() {
  const [visibility, setVisibility] = useState<Record<WidgetId, boolean>>(readVisibility);
  const [widgetOrder, setWidgetOrderState] = useState<WidgetId[]>(readOrder);

  const toggle = useCallback((id: WidgetId) => {
    setVisibility(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(VISIBILITY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setWidgetOrder = useCallback((order: WidgetId[]) => {
    setWidgetOrderState(order);
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  }, []);

  const resetToDefaults = useCallback(() => {
    const defaults = Object.fromEntries(
      WIDGET_CATALOG.map(w => [w.id, w.defaultVisible])
    ) as Record<WidgetId, boolean>;
    setVisibility(defaults);
    setWidgetOrderState([...DEFAULT_ORDER]);
    localStorage.setItem(VISIBILITY_KEY, JSON.stringify(defaults));
    localStorage.setItem(ORDER_KEY, JSON.stringify(DEFAULT_ORDER));
  }, []);

  const isVisible = useCallback(
    (id: WidgetId) => visibility[id] ?? true,
    [visibility]
  );

  return { visibility, widgetOrder, toggle, setWidgetOrder, resetToDefaults, isVisible };
}
