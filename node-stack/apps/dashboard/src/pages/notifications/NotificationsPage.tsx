import { FC, useState } from "react";
import {
  Bell,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Check,
  Trash2,
  Loader2,
  Package,
  Settings,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { cn } from "@/utils/classNames";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import {
  useMarkAsRead,
  useMarkAllAsRead,
  useDismissNotification,
  useSeedNotifications,
} from "@/features/notifications/hooks/useNotificationMutations";
import type { Notification, NotificationType } from "@node-stack/types";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Button } from "@node-stack/ui";

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; label: string }> = {
  info:    { icon: Info,         color: "text-blue-500",    label: "Info" },
  warning: { icon: AlertTriangle, color: "text-amber-500",  label: "Aviso" },
  success: { icon: CheckCircle2, color: "text-emerald-500", label: "Éxito" },
  error:   { icon: XCircle,      color: "text-rose-500",    label: "Error" },
};

function relativeTime(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const s  = Math.floor(ms / 1000);
  if (s < 60)  return "Ahora";
  const m = Math.floor(s / 60);
  if (m < 60)  return `Hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `Hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `Hace ${d}d`;
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

type FilterTab = "all" | "unread" | "payouts" | "products" | "settings";

const FILTER_TABS: { key: FilterTab; label: string; icon?: React.ElementType }[] = [
  { key: "all",      label: "Todas" },
  { key: "unread",   label: "Sin leer" },
  { key: "payouts",  label: "Pagos",     icon: CreditCard },
  { key: "products", label: "Productos", icon: Package },
  { key: "settings", label: "Ajustes",   icon: Settings },
];

// ─── Notification Card ────────────────────────────────────────────────────────

const NotificationCard: FC<{
  notification: Notification;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}> = ({ notification, onRead, onDismiss }) => {
  const { icon: Icon, color } = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.info;

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 rounded-[16px] border px-5 py-4 transition-all duration-200",
        notification.read
          ? "border-[var(--border)] bg-white dark:bg-surface hover:border-gray-200 dark:hover:border-white/10"
          : "border-primary/20 bg-primary/[0.02] dark:bg-primary/[0.04]"
      )}
    >
      {/* Icon — small, no heavy background */}
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", color)} />

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className={cn(
              "text-[14px] leading-snug truncate",
              notification.read
                ? "text-fg-secondary"
                : "font-semibold text-fg"
            )}>
              {notification.title}
            </h3>
            {!notification.read && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <span className="text-[12px] text-gray-400 shrink-0 whitespace-nowrap mt-0.5">
            {relativeTime(notification.createdAt)}
          </span>
        </div>

        {/* Body */}
        <p className={cn(
          "mt-1 text-[13px] leading-relaxed line-clamp-2 max-w-prose",
          notification.read
            ? "text-fg-muted"
            : "text-gray-600 dark:text-gray-300"
        )}>
          {notification.body}
        </p>

        {/* Actions — appear on hover */}
        <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-200">
          {!notification.read && (
            <button
              onClick={() => onRead(notification.id)}
              className="flex items-center gap-1.5 rounded-lg bg-primary/[0.08] px-3 py-1.5 text-[12px] font-medium text-primary hover:bg-primary/15 transition-colors active:scale-95"
            >
              <Check className="h-3 w-3" />
              Marcar como leída
            </button>
          )}
          <button
            onClick={() => onDismiss(notification.id)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-gray-400 hover:bg-gray-100 hover:text-rose-500 dark:hover:bg-surface-hover transition-colors active:scale-95"
          >
            <Trash2 className="h-3 w-3" />
            Descartar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const NotificationsPage: FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const { data: notifications = [], isLoading, error } = useNotifications({
    ...(activeFilter === "unread" ? { unread: true } : {}),
  }) as { data: Notification[]; isLoading: boolean; error: any };

  const markAsRead    = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const dismiss       = useDismissNotification();
  const seed          = useSeedNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-[13px] text-gray-400">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-rose-50 dark:bg-rose-500/10">
          <XCircle className="h-7 w-7 text-rose-500" />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-fg">Error de conexión</p>
          <p className="text-[13px] text-gray-400 mt-1">No pudimos cargar las notificaciones.</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-20 px-4 md:px-8 animate-fade-in">
      <SectionHeader
        title="Notificaciones"
        subtitle="Mantente al día con la actividad de tu cuenta y la plataforma."
        action={
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                className="rounded-xl h-10 px-5 text-[12px] font-medium"
              >
                {markAllAsRead.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <><Check className="h-3.5 w-3.5 mr-1.5" />Marcar todo leído</>
                }
              </Button>
            )}
            <Button
              onClick={() => seed.mutate()}
              loading={seed.isPending}
              className="rounded-xl h-10 px-5 text-[12px] font-medium bg-surface-muted text-gray-500 border-none shadow-none hover:bg-surface-hover"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Generar pruebas
            </Button>
          </div>
        }
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-surface-muted p-1 w-fit border border-border">
        {FILTER_TABS.map(({ key, label, icon: TabIcon }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-medium transition-all duration-200 whitespace-nowrap active:scale-95",
              activeFilter === key
                ? "bg-white dark:bg-surface text-fg shadow-sm border border-border"
                : "text-fg-secondary hover:text-gray-800 dark:hover:text-gray-200"
            )}
          >
            {TabIcon && <TabIcon className="h-3.5 w-3.5" />}
            {label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {notifications.length > 0 ? (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onRead={(id) => markAsRead.mutate(id)}
              onDismiss={(id) => dismiss.mutate(id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-border py-24 px-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-surface-muted mb-5 relative">
            <Bell className="h-7 w-7 text-gray-300 dark:text-gray-600" />
            <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-primary border-2 border-white dark:border-[#121212]" />
          </div>
          <h3 className="text-[18px] font-bold text-fg">¡Todo en orden!</h3>
          <p className="mt-2 text-[13px] text-gray-400 max-w-sm leading-relaxed">
            {activeFilter === "unread"
              ? "No tienes notificaciones pendientes. Te avisaremos si algo cambia."
              : "Tu bandeja está vacía. Las actualizaciones importantes aparecerán aquí."}
          </p>
          {activeFilter !== "all" && (
            <Button
              variant="outline"
              onClick={() => setActiveFilter("all")}
              className="mt-6 rounded-xl text-[12px]"
            >
              Ver historial completo
            </Button>
          )}
        </div>
      )}

      {/* Legend */}
      {notifications.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-[12px] text-gray-400">Sin leer</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700" />
            <span className="text-[12px] text-gray-400">Leída</span>
          </div>
          <span className="text-[12px] text-gray-300 dark:text-gray-600 ml-auto">
            Las notificaciones se eliminan automáticamente después de 30 días.
          </span>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
