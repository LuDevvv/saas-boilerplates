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
  Filter,
  Inbox
} from "lucide-react";
import { cn } from "@/utils/classNames";
import {
  useNotifications,
  useUnreadCount
} from "@/features/notifications/hooks/useNotifications";
import {
  useMarkAsRead,
  useMarkAllAsRead,
  useDismissNotification,
} from "@/features/notifications/hooks/useNotificationMutations";
import { Notification, NotificationType } from "@/features/notifications/api/notifications.api";
import { SectionHeader } from "@/components/layout/SectionHeader";

// ─── Helpers ───────────────────────────────────────────────

const typeConfig: Record<NotificationType, { icon: typeof Info; color: string; bg: string; ring: string }> = {
  info: {
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
    ring: "ring-blue-500/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
    ring: "ring-amber-500/20",
  },
  success: {
    icon: CheckCircle2,
    color: "text-teal-600",
    bg: "bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400",
    ring: "ring-teal-500/20",
  },
  error: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-500/10 dark:text-red-400",
    ring: "ring-red-500/20",
  },
};

function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Ahora";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return date.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  });
}

type FilterTab = "all" | "unread" | "read";

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: "all", label: "TODAS" },
  { key: "unread", label: "SIN LEER" },
  { key: "read", label: "LEÍDAS" },
];

// ─── Notification Card ─────────────────────────────────────

interface NotificationCardProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

const NotificationCard: FC<NotificationCardProps> = ({ notification, onRead, onDismiss }) => {
  const config = typeConfig[notification.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "group relative flex items-start gap-5 rounded-[20px] border p-5 transition-all duration-300 active:scale-[0.99]",
        notification.read
          ? "border-gray-100 bg-white/80 backdrop-blur-md hover:border-primary-100 dark:border-white/10 dark:bg-gray-900/50"
          : "border-primary-100 bg-primary-50/20 dark:border-primary-500/20 dark:bg-primary-500/5 shadow-sm"
      )}
    >
      {/* Type Icon */}
      <div className={cn("mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105", config.bg)}>
        <Icon className={cn("h-5 w-5", config.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "text-sm ",
              notification.read
                ? "font-label text-gray-600 dark:text-gray-400"
                : "font-label text-gray-950 dark:text-white"
            )}>
              {notification.title}
            </h3>
            {!notification.read && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(113,68,249,0.5)]" />
            )}
          </div>
          <span className="shrink-0 text-[10px] font-label text-gray-400 uppercase  mt-0.5">
            {relativeTime(notification.createdAt)}
          </span>
        </div>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-label">
          {notification.body}
        </p>

        {/* Action row */}
        <div className="mt-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 duration-300">
          {!notification.read && (
            <button
              onClick={() => onRead(notification.id)}
              className="flex items-center gap-1.5 rounded-xl bg-primary-50 px-3 py-1.5 text-[10px] font-label text-primary-600 hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-400 transition-all active:scale-95"
            >
              <Check className="h-3.5 w-3.5" />
              MARCAR COMO LEÍDA
            </button>
          )}
          <button
            onClick={() => onDismiss(notification.id)}
            className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 text-[10px] font-label text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 transition-all active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" />
            ELIMINAR
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Notifications Page ────────────────────────────────────

const NotificationsPage: FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  
  const { data: notifications = [], isLoading, error } = useNotifications({
    ...(activeFilter === "unread" ? { unread: true } : {}),
    ...(activeFilter === "read" ? { read: true } : {}),
  });

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const dismissMutation = useDismissNotification();

  const { data: unreadCount = 0 } = useUnreadCount();

  // ─── Loading State ─────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
          <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full" />
        </div>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────
  if (error) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-red-50 dark:bg-red-900/20 border border-red-100">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-lg font-heading text-red-950 dark:text-red-200">Error de Conexión</p>
          <p className="text-sm text-red-600/70 font-label">No pudimos sincronizar tus notificaciones.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 w-full max-w-[1600px] mx-auto pb-20 px-4 md:px-6 animate-fade-in">
      <SectionHeader
        title="Notificaciones"
        subtitle="Gestiona y revisa todas tus alertas y actualizaciones en un solo lugar."
        action={
          unreadCount > 0 && activeFilter !== "read" && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 text-sm font-heading text-white shadow-xl shadow-blue-900/20 hover:bg-primary-700 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 group"
            >
              {markAllAsReadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4 group-hover:scale-110 transition-transform" />
              )}
              Marcar todas como leídas
            </button>
          )
        }
      />

      {/* 2. Filter Bar - Bento Style */}
      <div className="flex items-center gap-1.5 rounded-[20px] bg-white/80 backdrop-blur-md p-1.5 border border-gray-100 dark:bg-gray-900/50 dark:border-white/10 shadow-sm w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              "rounded-[14px] px-6 py-3 text-[10px] font-heading  transition-all duration-300 active:scale-95",
              activeFilter === tab.key
                ? "bg-primary-600 text-white shadow-lg shadow-blue-900/20"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Content Area */}
      {notifications.length > 0 ? (
        <div className="grid gap-4">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onRead={(id) => markAsReadMutation.mutate(id)}
              onDismiss={(id) => dismissMutation.mutate(id)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-gray-100 bg-white/80 backdrop-blur-md py-24 px-8 dark:border-white/10 dark:bg-gray-900/50 shadow-sm">
          <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-gray-50 dark:bg-primary-500/10 mb-8 transform group-hover:rotate-6 transition-transform">
            <Inbox className="h-10 w-10 text-primary-300" />
          </div>
          <h3 className="text-2xl font-heading text-gray-950 dark:text-white ">Todo al día</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-center max-w-sm font-label leading-relaxed">
            {activeFilter === "unread"
              ? "¡Excelente! No tienes notificaciones pendientes de revisión."
              : "Las notificaciones importantes de tu plataforma aparecerán en esta sección."}
          </p>
        </div>
      )}

      {/* 4. Footer Stats Bar */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between rounded-[24px] border border-gray-100 bg-white/80 backdrop-blur-md px-8 py-6 dark:border-white/10 dark:bg-gray-900/50 shadow-sm mt-4 group">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-2 transition-transform group-hover:scale-110">
                <Bell className="h-4 w-4 text-gray-400" />
              </div>
              <span className="text-sm font-label text-gray-500 dark:text-gray-400">
                <span className="font-label text-gray-950 dark:text-white">{notifications.length}</span> Notificaciones totales
              </span>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(113,68,249,0.5)]" />
                <span className="text-sm font-label text-gray-500 dark:text-gray-400">
                  <span className="font-label text-primary-600 dark:text-primary-400">{unreadCount}</span> sin leer
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-label text-gray-400 uppercase ">
            <Filter className="h-3.5 w-3.5" />
            VISTA: {filterTabs.find((t) => t.key === activeFilter)?.label}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
