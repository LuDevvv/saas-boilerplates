import { FC } from "react";
import { Smartphone, XCircle, ShieldCheck, Laptop, Globe, LogOut, Loader2 } from "lucide-react";
import { Card, Spinner } from "@node-stack/ui";
import { useSessions } from "../hooks/useSessions";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface LoginHistoryProps {
  onRevokeAll?: () => void;
  isRevokingAll?: boolean;
  canRevokeAll?: boolean;
}

export const LoginHistory: FC<LoginHistoryProps> = ({ onRevokeAll, isRevokingAll, canRevokeAll }) => {
  const { sessions, isLoading, revokeSession, isRevoking } = useSessions();

  if (isLoading) {
    return (
      <Card className="card-premium p-20 flex flex-col items-center justify-center min-h-[300px]">
        <Spinner size="lg" className="text-primary mb-6" />
        <p className="text-sm text-gray-500 font-label">Analizando sesiones activas...</p>
      </Card>
    );
  }

  const getDeviceIcon = (userAgent: string = "") => {
    const ua = userAgent.toLowerCase();
    if (ua.includes("mobi") || ua.includes("android") || ua.includes("iphone") || ua.includes("ipad")) {
      return <Smartphone className="h-6 w-6 text-emerald-500" />;
    }
    if (ua.includes("electron") || ua.includes("windows") || ua.includes("mac") || ua.includes("linux")) {
      return <Laptop className="h-6 w-6 text-blue-500" />;
    }
    return <Globe className="h-6 w-6 text-slate-400" />;
  };

  const getDeviceTypeLabel = (userAgent: string = "") => {
    const ua = userAgent.toLowerCase();
    if (ua.includes("iphone") || ua.includes("ipad")) return "Apple Device";
    if (ua.includes("android")) return "Android Device";
    if (ua.includes("windows")) return "Windows PC";
    if (ua.includes("macintosh") || ua.includes("mac os")) return "MacBook / iMac";
    if (ua.includes("linux")) return "Linux System";
    return "Navegador Web";
  };

  return (
    <Card className="overflow-hidden border-border shadow-[var(--shadow-card)] rounded-[20px] bg-surface flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-fg uppercase">Sesiones Activas</h2>
            <p className="text-[10px] font-medium text-fg-muted uppercase">Seguridad</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border flex-1">
        {sessions.map((session: any) => (
          <div key={session.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-hover group gap-4 transition-colors">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-surface-muted border border-border flex items-center justify-center shrink-0 shadow-sm">
                {getDeviceIcon(session.userAgent)}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-bold text-fg truncate">
                    {session.device || getDeviceTypeLabel(session.userAgent)}
                  </p>
                  {session.isCurrent && (
                    <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      Actual
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[10px] font-semibold text-fg-muted uppercase">
                  <span className="truncate">{session.location || "Ubicación desconocida"}</span>
                  <span className="shrink-0 opacity-30">•</span>
                  <span className="shrink-0">{session.lastUsedAt ? formatDistanceToNow(new Date(session.lastUsedAt), { addSuffix: true, locale: es }) : "Ahora"}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center shrink-0">
              {!session.isCurrent && (
                <button
                  onClick={() => revokeSession(session.id)}
                  disabled={isRevoking}
                  className="h-8 w-8 flex items-center justify-center rounded-md text-fg-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-95 border border-transparent"
                  title="Finalizar"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="p-12 text-center">
            <ShieldCheck className="h-8 w-8 text-fg-disabled mx-auto mb-3" />
            <p className="text-[12px] text-fg-muted font-bold uppercase">Sin otras sesiones</p>
          </div>
        )}
      </div>

      {/* Revoke-all action — discreet, inside the card */}
      {onRevokeAll && canRevokeAll && (
        <div className="border-t border-border px-5 py-3 flex items-center justify-end">
          <button
            onClick={onRevokeAll}
            disabled={isRevokingAll}
            className="inline-flex items-center gap-2 h-8 px-3 rounded-lg text-[11px] font-semibold uppercase text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRevokingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
            Cerrar todas las sesiones
          </button>
        </div>
      )}
    </Card>
  );
};