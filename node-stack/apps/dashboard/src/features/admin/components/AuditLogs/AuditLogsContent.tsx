import type { AuditLog } from "@node-stack/types";
import { PageHeader } from "@node-stack/ui";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Activity, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Shield, User, CreditCard,
  Settings, Key, LogIn, LogOut, Trash2, FileText,
} from "lucide-react";
import { FC, useState } from "react";

import { useAuditLogs } from "@/features/admin";
import { cn } from "@/utils/classNames";

// ─── Action helpers ──────────────────────────────────────────────────────────

const ACTION_META: Record<string, { label: string; icon: typeof Activity; color: string; dot: string }> = {
  "auth.login_succeeded":      { label: "Inicio de sesión",       icon: LogIn,     color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10", dot: "bg-emerald-500" },
  "auth.login_failed":         { label: "Login fallido",          icon: LogIn,     color: "text-red-600 dark:text-red-400 bg-red-500/10",             dot: "bg-red-500" },
  "auth.logout":               { label: "Cierre de sesión",       icon: LogOut,    color: "text-fg-muted bg-surface-muted",                          dot: "bg-fg-muted" },
  "auth.user_registered":      { label: "Registro",               icon: User,      color: "text-primary bg-primary/10",                              dot: "bg-primary" },
  "auth.password_changed":     { label: "Cambio de contraseña",   icon: Key,       color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",       dot: "bg-amber-500" },
  "auth.two_factor_enabled":   { label: "2FA activado",           icon: Shield,    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10", dot: "bg-emerald-500" },
  "auth.two_factor_disabled":  { label: "2FA desactivado",        icon: Shield,    color: "text-red-600 dark:text-red-400 bg-red-500/10",             dot: "bg-red-500" },
  "auth.api_key_created":      { label: "API Key creada",         icon: Key,       color: "text-primary bg-primary/10",                              dot: "bg-primary" },
  "auth.api_key_revoked":      { label: "API Key revocada",       icon: Key,       color: "text-red-600 dark:text-red-400 bg-red-500/10",             dot: "bg-red-500" },
  "workspace.member_invited":  { label: "Miembro invitado",       icon: User,      color: "text-primary bg-primary/10",                              dot: "bg-primary" },
  "workspace.member_joined":   { label: "Miembro unido",          icon: User,      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10", dot: "bg-emerald-500" },
  "workspace.member_removed":  { label: "Miembro eliminado",      icon: User,      color: "text-red-600 dark:text-red-400 bg-red-500/10",             dot: "bg-red-500" },
  "billing.subscription_created": { label: "Suscripción creada",  icon: CreditCard, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10", dot: "bg-emerald-500" },
  "billing.subscription_canceled": { label: "Suscripción cancelada", icon: CreditCard, color: "text-red-600 dark:text-red-400 bg-red-500/10",        dot: "bg-red-500" },
  "admin.user_role_changed":   { label: "Rol cambiado",           icon: Shield,    color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",       dot: "bg-amber-500" },
  "admin.user_impersonated":   { label: "Impersonación",          icon: User,      color: "text-violet-600 dark:text-violet-400 bg-violet-500/10",    dot: "bg-violet-500" },
  "system.config_updated":     { label: "Config. actualizada",    icon: Settings,  color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",       dot: "bg-amber-500" },
  "auth.account_closed":       { label: "Cuenta cerrada",         icon: Trash2,    color: "text-red-600 dark:text-red-400 bg-red-500/10",             dot: "bg-red-500" },
};

const getActionMeta = (action: string) =>
  ACTION_META[action] ?? {
    label: action.replace(/\./g, " · ").replace(/_/g, " "),
    icon: FileText,
    color: "text-fg-muted bg-surface-muted",
    dot: "bg-fg-muted",
  };

// ─── Row ─────────────────────────────────────────────────────────────────────

const AuditRow: FC<{ log: AuditLog }> = ({ log }) => {
  const meta = getActionMeta(log.action);
  const Icon = meta.icon;

  return (
    <div className="flex items-start gap-3 px-5 py-3.5 border-b border-border-subtle last:border-0 hover:bg-surface-hover transition-colors">
      <div className={cn("h-8 w-8 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5", meta.color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[13px] font-semibold text-fg">{meta.label}</p>
          {log.workspaceId && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-muted border border-border-subtle text-fg-muted">
              ws:{log.workspaceId.slice(0, 8)}
            </span>
          )}
        </div>
        <p className="text-[11px] text-fg-muted mt-0.5">
          {log.userId ? `Usuario: ${log.userId.slice(0, 8)}…` : "Sistema"}
          {log.entityType && ` · ${log.entityType}`}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-[12px] font-medium text-fg-secondary">
          {(() => {
            try { return format(new Date(log.createdAt), "d MMM", { locale: es }); } catch { return "—"; }
          })()}
        </p>
        <p className="text-[10px] text-fg-muted tabular-nums">
          {(() => {
            try { return format(new Date(log.createdAt), "HH:mm:ss"); } catch { return ""; }
          })()}
        </p>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const DOMAIN_FILTERS = [
  { value: "", label: "Todos" },
  { value: "auth", label: "Autenticación" },
  { value: "workspace", label: "Workspace" },
  { value: "billing", label: "Billing" },
  { value: "admin", label: "Admin" },
];

export const AuditLogsContent: FC = () => {
  const [page, setPage] = useState(1);
  const [domain, setDomain] = useState("");

  const { data, isLoading, error } = useAuditLogs({
    page,
    limit: 50,
    action: domain || undefined,
  });

  const logs = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="ADMIN"
        title="Registro de Auditoría"
        description="Historial de todas las acciones de seguridad y configuración de la plataforma."
        className="mb-6"
      />

      <div className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)]">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border-subtle flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            {DOMAIN_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setDomain(f.value); setPage(1); }}
                className={cn(
                  "h-7 px-3 rounded-lg text-[11px] font-semibold transition-all",
                  domain === f.value
                    ? "bg-primary text-primary-foreground"
                    : "text-fg-muted hover:text-fg hover:bg-surface-hover"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Activity className="h-3.5 w-3.5 text-fg-muted" />
            <span className="text-[11px] text-fg-muted">{meta?.total ?? 0} eventos</span>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-fg-muted" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
            <div className="h-10 w-10 rounded-[14px] bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-[14px] font-semibold text-fg">Sin conexión con el API</p>
            <p className="text-[12px] text-fg-muted max-w-xs">
              Comprueba que el servidor esté levantado y que tengas los permisos de administrador.
            </p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
            <div className="h-10 w-10 rounded-[14px] bg-surface-muted border border-border flex items-center justify-center">
              <Activity className="h-5 w-5 text-fg-muted" />
            </div>
            <p className="text-[14px] font-semibold text-fg">Sin registros</p>
            <p className="text-[12px] text-fg-muted">
              {domain ? `No hay eventos de "${DOMAIN_FILTERS.find(f => f.value === domain)?.label?.toLowerCase()}" aún.` : "No hay actividad registrada todavía."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {logs.map(log => (
              <AuditRow key={log.id} log={log} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border-subtle">
            <p className="text-[12px] text-fg-muted">
              Página {meta.page} de {meta.pages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 rounded-lg border border-border text-fg-muted hover:text-fg hover:bg-surface-hover disabled:opacity-40 transition-colors flex items-center justify-center"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                disabled={page === meta.pages}
                className="h-8 w-8 rounded-lg border border-border text-fg-muted hover:text-fg hover:bg-surface-hover disabled:opacity-40 transition-colors flex items-center justify-center"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
