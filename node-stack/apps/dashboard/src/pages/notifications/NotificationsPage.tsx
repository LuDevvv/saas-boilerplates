import type { Notification, NotificationType } from "@node-stack/types";
import {
  Button,
  EmptyState,
  FilterTabs,
  LoadingState,
  PageHeader,
  SectionHeader,
  TwoColumnLayout,
} from "@node-stack/ui";
import {
  Bell,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Check,
  Trash2,
  Loader2,
  Sparkles,
  Mail,
  Smartphone,
  Globe,
  Moon,
  Megaphone,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { FC, useState } from "react";

import {
  useMarkAsRead,
  useMarkAllAsRead,
  useDismissNotification,
  useSeedNotifications,
} from "@/features/notifications/hooks/useNotificationMutations";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { cn } from "@/utils/classNames";


// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  info:    { icon: Info,          color: "text-blue-500 dark:text-blue-400" },
  warning: { icon: AlertTriangle, color: "text-amber-500 dark:text-amber-400" },
  success: { icon: CheckCircle2,  color: "text-emerald-500 dark:text-emerald-400" },
  error:   { icon: XCircle,       color: "text-red-500 dark:text-red-400" },
};

function relativeTime(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return "Ahora";
  const m = Math.floor(s / 60);
  if (m < 60) return `Hace ${m} m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Hace ${d} d`;
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

type FilterTab = "all" | "unread";

// ─── NotificationCard ────────────────────────────────────────────────────────

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
          ? "border-border bg-surface hover:border-border-strong"
          : "border-primary/20 bg-primary/[0.04]"
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", color)} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <h3
              className={cn(
                "text-[14px] leading-snug truncate",
                notification.read ? "text-fg-secondary" : "font-semibold text-fg"
              )}
            >
              {notification.title}
            </h3>
            {!notification.read && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <span className="text-[11px] text-fg-muted shrink-0 whitespace-nowrap mt-0.5">
            {relativeTime(notification.createdAt)}
          </span>
        </div>

        <p
          className={cn(
            "mt-1 text-[13px] leading-relaxed line-clamp-2 max-w-prose",
            notification.read ? "text-fg-muted" : "text-fg-secondary"
          )}
        >
          {notification.body}
        </p>

        <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-200">
          {!notification.read && (
            <button
              onClick={() => onRead(notification.id)}
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-[12px] font-medium text-primary hover:bg-primary/15 transition-colors active:scale-95"
            >
              <Check className="h-3 w-3" />
              Marcar como leída
            </button>
          )}
          <button
            onClick={() => onDismiss(notification.id)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-fg-muted hover:bg-surface-hover hover:text-red-500 transition-colors active:scale-95"
          >
            <Trash2 className="h-3 w-3" />
            Descartar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Preferences (mock UI) ───────────────────────────────────────────────────

const PreferencesPanel: FC = () => {
  const [channels, setChannels] = useState({ email: true, push: true, inApp: true });
  const [quietHours, setQuietHours] = useState(true);
  const [topics, setTopics] = useState({ marketing: false, security: true, billing: true });

  return (
    <div className="rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <SectionHeader
        eyebrow="PREFERENCIAS"
        title="Cómo te avisamos"
        description="Personaliza canales, horarios y temas."
        as="h3"
      />

      {/* Channels */}
      <div className="mt-5 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">
          Canales
        </p>
        <ChannelToggle
          icon={Mail}
          label="Email"
          description="Resumen diario y alertas críticas"
          enabled={channels.email}
          onToggle={() => setChannels((c) => ({ ...c, email: !c.email }))}
        />
        <ChannelToggle
          icon={Smartphone}
          label="Push"
          description="Notificaciones en dispositivos móviles"
          enabled={channels.push}
          onToggle={() => setChannels((c) => ({ ...c, push: !c.push }))}
        />
        <ChannelToggle
          icon={Globe}
          label="In-app"
          description="Centro de notificaciones del dashboard"
          enabled={channels.inApp}
          onToggle={() => setChannels((c) => ({ ...c, inApp: !c.inApp }))}
        />
      </div>

      {/* Quiet hours */}
      <div className="mt-6 pt-5 border-t border-border-subtle space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">
          Horario de silencio
        </p>
        <ChannelToggle
          icon={Moon}
          label="Silenciar 22:00 → 07:00"
          description="No recibirás push ni email durante la noche"
          enabled={quietHours}
          onToggle={() => setQuietHours((v) => !v)}
        />
      </div>

      {/* Topics */}
      <div className="mt-6 pt-5 border-t border-border-subtle space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">
          Agrupación por tema
        </p>
        <TopicToggle
          icon={Megaphone}
          label="Marketing"
          enabled={topics.marketing}
          onToggle={() => setTopics((t) => ({ ...t, marketing: !t.marketing }))}
        />
        <TopicToggle
          icon={ShieldCheck}
          label="Seguridad"
          enabled={topics.security}
          onToggle={() => setTopics((t) => ({ ...t, security: !t.security }))}
        />
        <TopicToggle
          icon={CreditCard}
          label="Billing"
          enabled={topics.billing}
          onToggle={() => setTopics((t) => ({ ...t, billing: !t.billing }))}
        />
      </div>
    </div>
  );
};

const ChannelToggle: FC<{
  icon: React.ElementType;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}> = ({ icon: Icon, label, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border-subtle bg-surface-muted">
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="h-8 w-8 rounded-[10px] bg-surface border border-border flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-fg-muted" />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-fg leading-snug">{label}</p>
        <p className="text-[10px] text-fg-muted leading-snug truncate">{description}</p>
      </div>
    </div>
    <button
      onClick={onToggle}
      className={cn(
        "relative h-5 w-9 rounded-full transition-colors shrink-0",
        enabled ? "bg-primary" : "bg-surface-hover border border-border"
      )}
      aria-pressed={enabled}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all shadow-sm",
          enabled ? "left-[18px]" : "left-0.5"
        )}
      />
    </button>
  </div>
);

const TopicToggle: FC<{
  icon: React.ElementType;
  label: string;
  enabled: boolean;
  onToggle: () => void;
}> = ({ icon: Icon, label, enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className="w-full flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-surface-hover transition-colors text-left"
  >
    <div className="flex items-center gap-2 min-w-0">
      <Icon className="h-3.5 w-3.5 text-fg-muted shrink-0" />
      <p className="text-[12px] font-medium text-fg">{label}</p>
    </div>
    <span
      className={cn(
        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
        enabled
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          : "bg-surface-muted text-fg-muted border-border"
      )}
    >
      {enabled ? "Activo" : "Pausado"}
    </span>
  </button>
);

// ─── Page ────────────────────────────────────────────────────────────────────

const NotificationsPage: FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const { data: notifications = [], isLoading, error } = useNotifications({
    ...(activeFilter === "unread" ? { unread: true } : {}),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as { data: Notification[]; isLoading: boolean; error: any };

  const markAsRead    = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const dismiss       = useDismissNotification();
  const seed          = useSeedNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      <PageHeader
        eyebrow="NOTIFICACIONES"
        title="Centro de notificaciones"
        description="Mantente al día con la actividad de tu cuenta y la plataforma."
        action={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                className="rounded-xl h-10 px-4 text-[12px] font-medium"
              >
                {markAllAsRead.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Marcar todo leído
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={() => seed.mutate()}
              loading={seed.isPending}
              className="rounded-xl h-10 px-4 text-[12px] font-medium bg-surface-muted border border-border text-fg-secondary hover:bg-surface-hover hover:text-fg"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Generar pruebas
            </Button>
          </div>
        }
        className="mb-6"
      />

      <TwoColumnLayout>
        <TwoColumnLayout.Main className="flex flex-col gap-4">
          <FilterTabs
            value={activeFilter}
            onChange={(v) => setActiveFilter(v as FilterTab)}
            ariaLabel="Filtrar notificaciones por estado"
            options={[
              { value: "all",    label: "Todas",   count: notifications.length },
              { value: "unread", label: "Sin leer", count: unreadCount },
            ]}
          />

          {isLoading ? (
            <LoadingState message="Cargando notificaciones..." />
          ) : error ? (
            <EmptyState
              icon={XCircle}
              title="Error de conexión"
              description="No pudimos cargar las notificaciones. Inténtalo de nuevo."
              action={
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="rounded-xl"
                >
                  Reintentar
                </Button>
              }
            />
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="¡Todo en orden!"
              description={
                activeFilter === "unread"
                  ? "No tienes notificaciones pendientes. Te avisaremos si algo cambia."
                  : "Tu bandeja está vacía. Las actualizaciones importantes aparecerán aquí."
              }
              action={
                activeFilter !== "all" ? (
                  <Button
                    variant="outline"
                    onClick={() => setActiveFilter("all")}
                    className="rounded-xl text-[12px]"
                  >
                    Ver historial completo
                  </Button>
                ) : undefined
              }
            />
          ) : (
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
          )}

          {notifications.length > 0 && (
            <p className="text-[11px] text-fg-muted px-1 mt-2">
              Las notificaciones se eliminan automáticamente después de 30 días.
            </p>
          )}
        </TwoColumnLayout.Main>

        <TwoColumnLayout.Aside>
          <PreferencesPanel />
        </TwoColumnLayout.Aside>
      </TwoColumnLayout>
    </div>
  );
};

export default NotificationsPage;
