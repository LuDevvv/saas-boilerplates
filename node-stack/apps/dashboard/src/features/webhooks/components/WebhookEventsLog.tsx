import { FilterTabs, StatusPill } from "@node-stack/ui";
import {
  Activity,
  RefreshCw,
  ChevronRight,
  Clock,
  Loader2,
  Filter,
} from "lucide-react";
import { FC, useState, useMemo } from "react";

import { ModalLayout } from "@/layouts/ModalLayout";


// ─── Mock data types ─────────────────────────────────────────────────────────

export interface WebhookDelivery {
  id: string;
  webhookUrl: string;
  eventType: string;
  statusCode: number;
  attempt: number;
  durationMs: number;
  createdAt: string;
  payload: Record<string, unknown>;
  response?: Record<string, unknown>;
}

const STATUS_FILTERS = [
  { value: "all" as const, label: "Todos" },
  { value: "2xx" as const, label: "Exitosos (2xx)" },
  { value: "4xx" as const, label: "Cliente (4xx)" },
  { value: "5xx" as const, label: "Servidor (5xx)" },
];

type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

// ─── Mock deliveries (replace with API) ──────────────────────────────────────

const MOCK_DELIVERIES: WebhookDelivery[] = [
  {
    id: "evt_1a2b3c",
    webhookUrl: "https://api.acme.com/hooks/payments",
    eventType: "payment.succeeded",
    statusCode: 200,
    attempt: 1,
    durationMs: 142,
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    payload: {
      id: "pay_abc123",
      type: "payment.succeeded",
      data: { amount: 4900, currency: "usd", customer: "cus_xyz" },
    },
    response: { received: true },
  },
  {
    id: "evt_4d5e6f",
    webhookUrl: "https://api.acme.com/hooks/users",
    eventType: "user.created",
    statusCode: 200,
    attempt: 1,
    durationMs: 87,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    payload: {
      id: "usr_def456",
      type: "user.created",
      data: { email: "alice@example.com", workspace: "ws_main" },
    },
  },
  {
    id: "evt_7g8h9i",
    webhookUrl: "https://api.acme.com/hooks/payments",
    eventType: "payment.failed",
    statusCode: 500,
    attempt: 2,
    durationMs: 5421,
    createdAt: new Date(Date.now() - 1000 * 60 * 27).toISOString(),
    payload: {
      id: "pay_ghi789",
      type: "payment.failed",
      data: { amount: 1200, currency: "eur", error: "card_declined" },
    },
    response: { error: "Internal Server Error" },
  },
  {
    id: "evt_jklmno",
    webhookUrl: "https://api.acme.com/hooks/users",
    eventType: "user.updated",
    statusCode: 401,
    attempt: 3,
    durationMs: 230,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    payload: {
      id: "usr_jkl012",
      type: "user.updated",
      data: { email: "bob@example.com" },
    },
    response: { error: "invalid_signature" },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getStatusTone = (code: number): "success" | "warning" | "danger" | "neutral" => {
  if (code >= 200 && code < 300) return "success";
  if (code >= 400 && code < 500) return "warning";
  if (code >= 500) return "danger";
  return "neutral";
};

const matchesFilter = (code: number, filter: StatusFilter) => {
  if (filter === "all") return true;
  if (filter === "2xx") return code >= 200 && code < 300;
  if (filter === "4xx") return code >= 400 && code < 500;
  if (filter === "5xx") return code >= 500;
  return true;
};

const formatRelativeTime = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 1000 / 60);
  if (m < 1) return "Ahora";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.floor(h / 24);
  return `Hace ${d} d`;
};

// ─── JSON viewer ─────────────────────────────────────────────────────────────

const JsonViewer: FC<{ value: unknown; label: string }> = ({ value, label }) => {
  const formatted = JSON.stringify(value, null, 2);
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase  text-fg-muted">{label}</p>
      <pre className="bg-surface-elevated border border-border rounded-xl p-4 text-[12px] text-fg-secondary overflow-x-auto custom-scrollbar font-mono leading-relaxed">
        <code>{syntaxHighlight(formatted)}</code>
      </pre>
    </div>
  );
};

// Very lightweight JSON syntax highlighting via JSX nodes.
const syntaxHighlight = (json: string) => {
  const parts: React.ReactNode[] = [];
  const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+-]?\d+)?)/g;
  let lastIndex = 0;
  let key = 0;
  json.replace(regex, (match, _g1, _g2, _g3, _g4, _g5, _g6, offset) => {
    if (offset > lastIndex) parts.push(json.slice(lastIndex, offset));
    let cls = "text-amber-600 dark:text-amber-400"; // numbers
    if (/^"/.test(match)) {
      cls = /:$/.test(match)
        ? "text-emerald-600 dark:text-emerald-400" // key
        : "text-blue-600 dark:text-blue-400";       // string
    } else if (/true|false/.test(match)) {
      cls = "text-primary";
    } else if (/null/.test(match)) {
      cls = "text-fg-muted";
    }
    parts.push(
      <span key={key++} className={cls}>
        {match}
      </span>
    );
    lastIndex = offset + match.length;
    return match;
  });
  if (lastIndex < json.length) parts.push(json.slice(lastIndex));
  return parts;
};

// ─── Component ───────────────────────────────────────────────────────────────

interface WebhookEventsLogProps {
  /** When provided, only deliveries from this webhook URL/id are shown. */
  webhookUrl?: string;
  /** Mock toggle — replace with `useWebhookDeliveries` when API is ready. */
  isLoading?: boolean;
}

export const WebhookEventsLog: FC<WebhookEventsLogProps> = ({ webhookUrl, isLoading = false }) => {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDelivery | null>(null);
  const [replayingId, setReplayingId] = useState<string | null>(null);

  const deliveries = useMemo(() => {
    let list = MOCK_DELIVERIES;
    if (webhookUrl) list = list.filter((d) => d.webhookUrl === webhookUrl);
    return list.filter((d) => matchesFilter(d.statusCode, filter));
  }, [filter, webhookUrl]);

  const handleReplay = (id: string) => {
    setReplayingId(id);
    setTimeout(() => setReplayingId(null), 1500); // mock latency
  };

  return (
    <div className="rounded-[20px] border border-border bg-surface overflow-hidden">
      {/* Header + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-[10px] bg-primary/10 border border-primary/15 flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-fg leading-snug">
              Log de entregas
            </h3>
            <p className="text-[11px] text-fg-muted mt-0.5">
              Últimos eventos enviados a este endpoint
            </p>
          </div>
        </div>

        <FilterTabs
          size="sm"
          value={filter}
          onChange={(v) => setFilter(v as StatusFilter)}
          ariaLabel="Filtrar entregas por status HTTP"
          options={STATUS_FILTERS.map((f, i) => ({
            value: f.value,
            label: f.label,
            icon: i === 0 ? <Filter className="h-3 w-3" /> : undefined,
          }))}
        />
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="p-12 flex items-center justify-center text-fg-muted text-sm">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Cargando entregas...
        </div>
      ) : deliveries.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-[13px] text-fg-muted">Sin entregas para los filtros actuales.</p>
        </div>
      ) : (
        <div className="divide-y divide-border-subtle">
          {deliveries.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDelivery(d)}
              className="w-full text-left flex items-center gap-3 px-5 py-3.5 hover:bg-surface-hover transition-colors"
            >
              <StatusPill
                label={`${d.statusCode}`}
                tone={getStatusTone(d.statusCode)}
                hideDot
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-fg truncate">
                  {d.eventType}
                </p>
                <p className="text-[11px] text-fg-muted truncate">{d.webhookUrl}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5 shrink-0 text-right">
                <span className="text-[11px] text-fg-secondary tabular-nums">
                  {d.durationMs} ms
                </span>
                <span className="text-[10px] text-fg-muted flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  {formatRelativeTime(d.createdAt)}
                  {d.attempt > 1 && (
                    <span className="ml-1 text-amber-600 dark:text-amber-400 font-bold">
                      · intento {d.attempt}
                    </span>
                  )}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-fg-muted shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Inspect drawer */}
      <ModalLayout
        isOpen={!!selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
        variant="drawer-right"
        title="Detalle de entrega"
        description={selectedDelivery?.eventType}
        footer={
          selectedDelivery && (
            <button
              onClick={() => handleReplay(selectedDelivery.id)}
              disabled={replayingId === selectedDelivery.id}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground text-[13px] font-semibold transition-colors disabled:opacity-60"
            >
              {replayingId === selectedDelivery.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Reenviar manualmente
                </>
              )}
            </button>
          )
        }
      >
        {selectedDelivery && (
          <div className="px-6 py-5 space-y-5">
            {/* Meta strip */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-surface-muted p-3">
                <p className="text-[10px] font-bold uppercase  text-fg-muted">Status</p>
                <div className="mt-1">
                  <StatusPill
                    label={`${selectedDelivery.statusCode}`}
                    tone={getStatusTone(selectedDelivery.statusCode)}
                    hideDot
                  />
                </div>
              </div>
              <div className="rounded-xl border border-border bg-surface-muted p-3">
                <p className="text-[10px] font-bold uppercase  text-fg-muted">Latencia</p>
                <p className="text-[14px] font-semibold text-fg mt-1 tabular-nums">
                  {selectedDelivery.durationMs} ms
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-muted p-3">
                <p className="text-[10px] font-bold uppercase  text-fg-muted">Intento</p>
                <p className="text-[14px] font-semibold text-fg mt-1 tabular-nums">
                  #{selectedDelivery.attempt}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-muted p-3">
                <p className="text-[10px] font-bold uppercase  text-fg-muted">Cuándo</p>
                <p className="text-[12px] text-fg mt-1">
                  {formatRelativeTime(selectedDelivery.createdAt)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase  text-fg-muted mb-1.5">
                Endpoint
              </p>
              <code className="block text-[11px] font-mono text-fg-secondary bg-surface-muted border border-border-subtle rounded-lg px-3 py-2 break-all">
                {selectedDelivery.webhookUrl}
              </code>
            </div>

            <JsonViewer value={selectedDelivery.payload} label="Payload enviado" />
            {selectedDelivery.response && (
              <JsonViewer value={selectedDelivery.response} label="Respuesta del servidor" />
            )}
          </div>
        )}
      </ModalLayout>
    </div>
  );
};
