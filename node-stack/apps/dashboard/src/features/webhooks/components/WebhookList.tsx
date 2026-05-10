import type { WebhookEndpoint } from "@node-stack/types";
import { Button, ConfirmDialog, Skeleton, StatusPill } from "@node-stack/ui";
import { Trash2, Globe, Calendar, Activity, Copy, Check, ShieldCheck } from "lucide-react";
import { FC, useState } from "react";

import { appToast } from "@/components/alerts/Toasts";
import { cn } from "@/utils/classNames";

interface WebhookListProps {
  webhooks: WebhookEndpoint[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, enabled: boolean) => Promise<void>;
}

export const WebhookList: FC<WebhookListProps> = ({ webhooks, isLoading, onDelete, onToggle }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopySecret = (secret: string, id: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedId(id);
    appToast.success({ title: "Secreto copiado", description: "Utilízalo para validar firmas de webhooks." });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-40 rounded-[20px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {webhooks.map((webhook) => (
        <div
          key={webhook.id}
          className="rounded-[20px] border border-border bg-surface p-5 group hover:shadow-[var(--shadow-card)] hover:border-border-strong transition-all duration-200"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={cn(
                    "h-10 w-10 rounded-[12px] border flex items-center justify-center shrink-0 transition-colors",
                    webhook.enabled
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-surface-muted border-border text-fg-muted"
                  )}
                >
                  <Globe className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-[14px] font-semibold text-fg truncate max-w-[300px]">
                      {webhook.url}
                    </h4>
                    <StatusPill
                      label={webhook.enabled ? "Activo" : "Pausado"}
                      tone={webhook.enabled ? "success" : "neutral"}
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-fg-muted uppercase  flex items-center gap-1">
                      <ShieldCheck size={10} /> Secreto:
                    </span>
                    <code className="text-[11px] font-mono text-fg-secondary bg-surface-muted border border-border-subtle px-2 py-0.5 rounded">
                      whsec_••••••••
                    </code>
                    <button
                      onClick={() => handleCopySecret(webhook.secret, webhook.id)}
                      className="h-6 w-6 rounded-md text-fg-muted hover:text-primary hover:bg-surface-hover transition-colors flex items-center justify-center"
                    >
                      {copiedId === webhook.id ? (
                        <Check size={12} className="text-emerald-500" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg font-medium text-[11px] uppercase  h-8"
                  onClick={() => onToggle(webhook.id, !webhook.enabled)}
                >
                  {webhook.enabled ? "Pausar" : "Activar"}
                </Button>
                <button
                  onClick={() => setDeletingId(webhook.id)}
                  className="h-8 w-8 rounded-lg text-fg-muted hover:text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border-subtle">
              {webhook.eventTypes.map((event) => (
                <span
                  key={event}
                  className="text-[10px] font-bold uppercase  px-2 py-0.5 rounded-md bg-surface-muted border border-border-subtle text-fg-secondary"
                >
                  {event}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-fg-muted">
              <span className="flex items-center gap-1.5">
                <Calendar size={11} />
                Registrado: {new Date(webhook.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Activity size={11} />
                Última entrega: <span className="text-fg-secondary">Hace 3 min</span>
              </span>
            </div>
          </div>
        </div>
      ))}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={async () => {
          if (deletingId) {
            await onDelete(deletingId);
            setDeletingId(null);
          }
        }}
        title="Eliminar Webhook"
        description="¿Estás seguro de que deseas eliminar este endpoint? Dejarás de recibir notificaciones en esta URL inmediatamente."
        confirmText="Eliminar Endpoint"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};
