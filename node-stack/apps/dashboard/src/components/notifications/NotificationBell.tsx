import { FC, useState, useRef, useEffect } from "react";
import { Bell, Info, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/classNames";
import { useNotifications, useUnreadCount } from "@/features/notifications/hooks/useNotifications";
import { useMarkAsRead, useMarkAllAsRead } from "@/features/notifications/hooks/useNotificationMutations";
import type { Notification, NotificationType } from "@node-stack/types";

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  info:    { icon: Info,         color: "text-blue-500" },
  warning: { icon: AlertTriangle, color: "text-amber-500" },
  success: { icon: CheckCircle2, color: "text-emerald-500" },
  error:   { icon: XCircle,      color: "text-rose-500" },
};

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const s  = Math.floor(ms / 1000);
  if (s < 60)  return "Ahora";
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `${d}d`;
  return new Date(dateStr).toLocaleDateString("es-ES", { month: "short", day: "numeric" });
}

const NotificationItem: FC<{ notification: Notification; onMarkRead: (id: string) => void }> = ({
  notification,
  onMarkRead,
}) => {
  const { icon: Icon, color } = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.info;

  return (
    <button
      onClick={() => !notification.read && onMarkRead(notification.id)}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150",
        "hover:bg-gray-50 dark:hover:bg-white/[0.04]",
        !notification.read && "cursor-pointer"
      )}
    >
      {/* Icon — small, no background */}
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", color)} />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-[13px] leading-snug truncate",
            notification.read
              ? "text-fg-secondary"
              : "font-semibold text-fg"
          )}>
            {notification.title}
          </p>
          <span className="text-[11px] text-gray-400 shrink-0 whitespace-nowrap mt-0.5">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-[12px] text-fg-muted line-clamp-2 leading-relaxed">
          {notification.body}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  );
};

export const NotificationBell: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: notifications = [] } = useNotifications({ limit: 5 });
  const { data: unreadCount = 0 } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const preview = notifications.slice(0, 5);

  return (
    <div className="relative inline-flex items-center justify-center" ref={dropdownRef}>
      {/* Bell trigger */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Notificaciones"
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-[12px] transition-all duration-200 active:scale-95 outline-none border border-transparent",
          isOpen
            ? "bg-primary/10 text-primary border-primary/20"
            : "text-fg-muted hover:bg-surface-hover hover:text-primary"
        )}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground ring-2 ring-canvas">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown — absolute on all screens (same pattern as AccountDropdown) */}
      {isOpen && (
        <div className={cn(
          "w-[360px] max-w-[calc(100vw-1rem)] overflow-hidden",
          "rounded-[20px] border border-border bg-surface-elevated",
          "shadow-[var(--shadow-elevated)]",
          "z-[100] animate-in fade-in slide-in-from-top-2 duration-200",
          "absolute top-full right-0 mt-2"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-fg">Notificaciones</span>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-primary hover:bg-primary/[0.08] transition-colors"
              >
                <Check className="h-3 w-3" />
                Marcar todas
              </button>
            )}
          </div>

          {/* Items */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-border custom-scrollbar">
            {preview.length > 0 ? (
              preview.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={(id) => markAsRead(id)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-14 px-5 text-center">
                <Bell className="h-8 w-8 text-gray-200 dark:text-gray-700 mb-3" />
                <p className="text-[13px] font-semibold text-fg-secondary">¡Todo al día!</p>
                <p className="text-[12px] text-gray-400 mt-1">No tienes alertas pendientes.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {preview.length > 0 && (
            <div className="border-t border-border px-2 py-2">
              <button
                onClick={() => { setIsOpen(false); navigate("/notifications"); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-medium text-primary hover:bg-primary/[0.08] transition-colors active:scale-[0.98]"
              >
                Ver todas las notificaciones
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
