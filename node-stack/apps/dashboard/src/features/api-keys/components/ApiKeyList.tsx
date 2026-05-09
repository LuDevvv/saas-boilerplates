import type { ApiKey } from "@node-stack/types";
import {
  CalloutCard,
  ConfirmDialog,
  Skeleton,
  StatusPill,
} from "@node-stack/ui";
import {
  Trash2,
  Calendar,
  Clock,
  Lock,
  Activity,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { FC, useState, useMemo } from "react";

import { cn } from "@/utils/classNames";

interface ApiKeyListProps {
  keys: ApiKey[];
  isLoading: boolean;
  onRevoke: (id: string) => Promise<void>;
}

// ─── Mock helpers (replace when backend ships them) ──────────────────────────

interface KeyMetrics {
  requestsToday: number;
  requestsTrend: number; // % change vs yesterday
  scopes: string[];
  expiresInDays?: number;
}

const MOCK_SCOPE_DOMAINS = [
  "Storage",
  "Tickets",
  "Webhooks",
  "Analytics",
  "Billing",
  "Members",
] as const;

const ACTIONS = ["Read", "Write", "Admin"] as const;

const getMockMetrics = (key: ApiKey): KeyMetrics => {
  // Deterministic mock based on key id hash
  const seed = key.id
    .split("")
    .reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 0);
  const requestsToday = (seed % 12000) + 50;
  const requestsTrend = ((seed % 41) - 20) / 10; // -2.0 .. +2.0%
  const numScopes = (seed % 4) + 1;
  const scopes = Array.from({ length: numScopes }).map((_, i) => {
    const domain = MOCK_SCOPE_DOMAINS[(seed + i) % MOCK_SCOPE_DOMAINS.length];
    const action = ACTIONS[(seed + i * 3) % ACTIONS.length];
    return `${domain}:${action}`;
  });
  const expiresInDays = (seed % 5 === 0) ? (seed % 14) + 1 : undefined; // some keys near expiry
  return { requestsToday, requestsTrend, scopes, expiresInDays };
};

const formatNumber = (n: number) => n.toLocaleString();

const formatRelativeTime = (iso?: string | null) => {
  if (!iso) return "Nunca";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 1000 / 60);
  if (m < 1) return "Ahora";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.floor(h / 24);
  return `Hace ${d} d`;
};

// ─── Scope badge ─────────────────────────────────────────────────────────────

const ScopeBadge: FC<{ scope: string }> = ({ scope }) => {
  const [domain, action] = scope.split(":");
  const tone = action === "Admin"
    ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
    : action === "Write"
    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
    : "bg-primary/10 text-primary border-primary/20";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono",
        tone
      )}
    >
      <span className="opacity-70">{domain}</span>
      <span className="opacity-40">:</span>
      <span>{action}</span>
    </span>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────

export const ApiKeyList: FC<ApiKeyListProps> = ({ keys, isLoading, onRevoke }) => {
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const enrichedKeys = useMemo(
    () => keys.map((k) => ({ key: k, metrics: getMockMetrics(k) })),
    [keys]
  );

  // Find any key that requires rotation (≤7 days)
  const rotationAlert = enrichedKeys.find(
    (e) => e.metrics.expiresInDays !== undefined && e.metrics.expiresInDays <= 7
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-[20px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Rotation warning */}
      {rotationAlert && (
        <CalloutCard
          icon={AlertTriangle}
          iconTone="warning"
          variant="muted"
          eyebrow="ACCIÓN REQUERIDA"
          title={`Rotación próxima — ${rotationAlert.key.name}`}
          description={`Esta clave expira en ${rotationAlert.metrics.expiresInDays} día${
            rotationAlert.metrics.expiresInDays === 1 ? "" : "s"
          }. Genera una nueva y migra antes de la fecha límite para evitar interrupciones.`}
          action={
            <button className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold transition-colors">
              <RefreshCw className="h-3.5 w-3.5" />
              Rotar ahora
            </button>
          }
        />
      )}

      {/* Keys */}
      <div className="space-y-3">
        {enrichedKeys.map(({ key, metrics }) => {
          const isExpiringSoon = metrics.expiresInDays !== undefined && metrics.expiresInDays <= 7;
          const trendSign = metrics.requestsTrend > 0 ? "+" : "";

          return (
            <div
              key={key.id}
              className="rounded-[20px] border border-border bg-surface p-5 group hover:shadow-[var(--shadow-card)] hover:border-border-strong transition-all duration-200"
            >
              <div className="flex flex-col gap-4">
                {/* Top row */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-[12px] bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                      <Lock className="w-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-[14px] font-semibold text-fg truncate">{key.name}</h4>
                        {isExpiringSoon && (
                          <StatusPill
                            label={`Expira en ${metrics.expiresInDays}d`}
                            tone="warning"
                            pulse
                          />
                        )}
                      </div>
                      <code className="inline-block text-[11px] font-mono text-primary bg-primary/10 border border-primary/15 px-2 py-0.5 rounded-md">
                        {key.prefix}••••••••••••
                      </code>
                    </div>
                  </div>

                  <button
                    onClick={() => setRevokingId(key.id)}
                    className="h-8 w-8 rounded-lg text-fg-muted hover:text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border-subtle">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
                      <Activity size={10} />
                      Hoy
                    </p>
                    <p className="text-[14px] font-semibold text-fg mt-1 tabular-nums">
                      {formatNumber(metrics.requestsToday)}
                      <span
                        className={cn(
                          "ml-1.5 text-[11px] font-bold tabular-nums",
                          metrics.requestsTrend > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : metrics.requestsTrend < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-fg-muted"
                        )}
                      >
                        {trendSign}
                        {metrics.requestsTrend.toFixed(1)}%
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
                      <Clock size={10} />
                      Último uso
                    </p>
                    <p className="text-[12px] text-fg-secondary mt-1">
                      {formatRelativeTime(key.lastUsedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
                      <Calendar size={10} />
                      Creada
                    </p>
                    <p className="text-[12px] text-fg-secondary mt-1">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">
                      Estado
                    </p>
                    <div className="mt-1">
                      <StatusPill label="Activa" tone="success" />
                    </div>
                  </div>
                </div>

                {/* Scopes */}
                {metrics.scopes.length > 0 && (
                  <div className="space-y-1.5 pt-3 border-t border-border-subtle">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">
                      Scopes ({metrics.scopes.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {metrics.scopes.map((s) => (
                        <ScopeBadge key={s} scope={s} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={!!revokingId}
        onClose={() => setRevokingId(null)}
        onConfirm={async () => {
          if (revokingId) {
            await onRevoke(revokingId);
            setRevokingId(null);
          }
        }}
        title="Revocar Clave API"
        description="¿Estás seguro de que deseas revocar esta clave? Cualquier aplicación que la utilice dejará de tener acceso inmediatamente. Esta acción no se puede deshacer."
        confirmText="Revocar Clave"
        cancelText="Mantener"
        variant="danger"
      />
    </div>
  );
};
