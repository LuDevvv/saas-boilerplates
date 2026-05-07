import { FC, useState } from "react";
import { 
  Card, 
  Button, 
  Badge,
  ConfirmDialog,
  Skeleton
} from "@node-stack/ui";
import { Trash2, Globe, Calendar, Activity, Copy, Check, ShieldCheck } from "lucide-react";
import { appToast } from "@/components/alerts/Toasts";
import type { WebhookEndpoint } from "@node-stack/types";

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
      <div className="space-y-4">
        {[1, 2].map(i => <Skeleton key={i} className="h-40 rounded-[24px]" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {webhooks.map((webhook) => (
        <Card key={webhook.id} className="p-6 rounded-3xl border-border bg-surface/95 shadow-sm group hover:shadow-md transition-all duration-300">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl border transition-colors ${webhook.enabled ? "bg-primary/10 border-primary/20 text-primary dark:bg-primary/20 dark:border-primary/30 dark:text-primary" : "bg-canvas border-border text-gray-400"}`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-heading text-fg truncate max-w-[300px]">{webhook.url}</h4>
                    <Badge variant={webhook.enabled ? "secondary" : "outline"} className={webhook.enabled ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "text-gray-400"}>
                      {webhook.enabled ? "Activo" : "Pausado"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-label text-gray-400 uppercase flex items-center gap-1">
                      <ShieldCheck size={10} /> Secreto:
                    </span>
                    <code className="text-[10px] font-mono text-gray-500 bg-canvas px-1.5 py-0.5 rounded">whsec_••••••••</code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-gray-400 hover:text-primary"
                      onClick={() => handleCopySecret(webhook.secret, webhook.id)}
                    >
                      {copiedId === webhook.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-heading text-[10px] uppercase h-9"
                  onClick={() => onToggle(webhook.id, !webhook.enabled)}
                >
                  {webhook.enabled ? "Pausar" : "Activar"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
                  onClick={() => setDeletingId(webhook.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
              {webhook.eventTypes.map(event => (
                <Badge key={event} variant="outline" className="text-[9px] font-label uppercase bg-canvas border-border text-gray-500">
                  {event}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-label text-gray-400 flex items-center gap-1.5">
                <Calendar size={10} /> Registrado: {new Date(webhook.createdAt).toLocaleDateString()}
              </span>
              <span className="text-[10px] font-label text-gray-400 flex items-center gap-1.5">
                <Activity size={10} /> Última entrega: Nunca
              </span>
            </div>
          </div>
        </Card>
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
