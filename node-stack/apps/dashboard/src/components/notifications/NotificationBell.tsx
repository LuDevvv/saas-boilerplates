import { FC, useState, useRef, useEffect } from "react";
import { Bell, Info, AlertTriangle, CheckCircle2, XCircle, ExternalLink, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/classNames";
import { useNotifications, useUnreadCount } from "@/features/notifications/hooks/useNotifications";
import { useMarkAsRead, useMarkAllAsRead } from "@/features/notifications/hooks/useNotificationMutations";
import { Notification, NotificationType } from "@/features/notifications/api/notifications.api";

// ─── Helpers ───────────────────────────────────────────────

const typeConfig: Record<NotificationType, { icon: typeof Info; color: string; bg: string }> = {
  info: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  success: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  error: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Ahora";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Hace ${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Hace ${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `Hace ${diffDay}d`;
  return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
}

// ─── NotificationItem ──────────────────────────────────────

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

const NotificationItem: FC<NotificationItemProps> = ({ notification, onMarkRead }) => {
  const config = typeConfig[notification.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <button
      onClick={() => !notification.read && onMarkRead(notification.id)}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer",
        !notification.read && "bg-blue-50/30 dark:bg-blue-900/5"
      )}
    >
      <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", config.bg)}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-sm truncate",
            notification.read
              ? "font-label text-gray-600 dark:text-gray-400"              : "font-heading text-gray-950 dark:text-white"
          )}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500 animate-pulse" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
          {notification.body}
        </p>
        <p className="mt-1 text-[10px] font-label text-gray-400 uppercase ">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
    </button>
  );
};

// ─── NotificationBell ──────────────────────────────────────

export const NotificationBell: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: notifications = [] } = useNotifications({ pageSize: 5 });
  const { data: unreadCount = 0 } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  // Start realtime on mount (DISABLED: API connection removed)
  /*
  useEffect(() => {
    startRealtime();
  }, [startRealtime]);
  */

  // Fetch full list when dropdown opens (DISABLED: API connection removed)
  /*
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);
  */

  // Click-outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const latestNotifications = notifications.slice(0, 5);

  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  return (
    <div className="relative inline-flex items-center justify-center" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-300 active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary border border-transparent",
          isOpen
            ? "bg-primary/10 text-primary border-primary/20"
            : "bg-gray-50/50 text-gray-500 hover:bg-gray-100 hover:text-primary hover:scale-[1.05] dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white hover:border-sidebar-border"
        )}
        aria-label="Notificaciones"
        id="notification-bell-btn"
      >
        <Bell className={cn("h-4 w-4 transition-transform", isOpen && "scale-110")} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-label text-white shadow-lg shadow-red-500/30 animate-in zoom-in duration-200 ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className={cn(
          "mt-3 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-900/10 dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-black/50 z-[100] animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden",
          "fixed left-1/2 -translate-x-1/2 top-16 lg:absolute lg:left-auto lg:right-0 lg:translate-x-0 lg:top-full"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 px-4 py-3">
            <h3 className="text-sm font-heading text-gray-950 dark:text-white">
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-label text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
              >
                <Check className="h-3 w-3" />
                Marcar todas
              </button>
            )}
          </div>

          {/* Notification Items */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-gray-50 dark:divide-white/[0.03]">
            {latestNotifications.length > 0 ? (
              latestNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={(id) => markAsRead(id)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800 mb-3">
                  <Bell className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-sm font-label text-gray-400 dark:text-gray-500">
                  Sin notificaciones
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                  Estás al día
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {latestNotifications.length > 0 && (
            <div className="border-t border-gray-100 dark:border-white/5">
              <button
                onClick={handleViewAll}
                className="flex w-full items-center justify-center gap-2 py-3 text-sm font-heading text-blue-600 hover:bg-gray-50 dark:text-blue-400 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                Ver todas las notificaciones
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
