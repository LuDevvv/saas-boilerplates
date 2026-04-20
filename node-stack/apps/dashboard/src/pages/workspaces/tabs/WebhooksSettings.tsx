import { useState, useEffect } from "react";
import { Plus, Webhook, Trash2, CheckCircle, Copy } from "lucide-react";
import { webhookService, WebhookEndpoint } from "@/services/workspaces/webhookService";
import { Button } from "@/components/ui/form/Button";
import { Input } from "@/components/ui/form/Input";
import { ModalLayout } from "@/layouts/ModalLayout";
import { appToast } from "@/components/alerts/Toasts";

interface WebhooksSettingsProps {
  workspaceId: string;
}

const WebhooksSettings = ({ workspaceId }: WebhooksSettingsProps) => {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  useEffect(() => {
    const fetchWebhooks = async () => {
      try {
        const data = await webhookService.getWebhooks(workspaceId);
        setWebhooks(data);
      } catch (error) {
        console.error("Error fetching webhooks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWebhooks();
  }, [workspaceId]);

  const handleCreate = async () => {
    if (!newWebhookUrl) return;
    try {
      const created = await webhookService.createWebhook(workspaceId, newWebhookUrl, ["*"]);
      setWebhooks([created, ...webhooks]);
      setIsModalOpen(false);
      setNewWebhookUrl("");
      appToast.success({
        title: "Webhook creado",
        description: "El endpoint se ha registrado correctamente."
      });
    } catch (error) {
      appToast.error({ title: "Error", description: "No se pudo crear el webhook." });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await webhookService.deleteWebhook(id);
      setWebhooks(webhooks.filter(w => w.id !== id));
      appToast.success({ title: "Webhook eliminado" });
    } catch (error) {
      appToast.error({ title: "Error" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    appToast.info({ title: "Copiado al portapapeles" });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Webhooks</h3>
          <p className="text-slate-400 text-sm">
            Recibe notificaciones en tiempo real en tus propios servidores.
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          icon={<Plus size={18} />}
        >
          Añadir Endpoint
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Cargando endpoints...</div>
      ) : webhooks.length === 0 ? (
        <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
            <Webhook size={32} />
          </div>
          <p className="text-slate-400">No hay webhooks configurados aún.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {webhooks.map((webhook) => (
            <div 
              key={webhook.id}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 transition-all hover:border-slate-700 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${webhook.enabled ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-slate-600"}`} />
                  <span className="text-white font-medium truncate max-w-md">{webhook.url}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(webhook.id)}
                    className="text-slate-500 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-black/20 rounded-lg p-3 border border-slate-800/50">
                  <span className="text-slate-500 uppercase tracking-wider block mb-1">Signing Secret</span>
                  <div className="flex justify-between items-center">
                    <code className="text-indigo-400">{webhook.secret.substring(0, 12)}...</code>
                    <button onClick={() => copyToClipboard(webhook.secret)} className="text-slate-500 hover:text-white transition-colors">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-3 border border-slate-800/50">
                  <span className="text-slate-500 uppercase tracking-wider block mb-1">Eventos</span>
                  <span className="text-slate-300">{webhook.eventTypes.join(", ")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Webhook Modal */}
      <ModalLayout
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configurar Webhook"
        subtitle="Introduce la URL del endpoint para recibir eventos."
      >
        <div className="flex flex-col gap-6 py-4">
          <Input 
            label="URL del Endpoint"
            placeholder="https://tu-api.com/webhooks"
            value={newWebhookUrl}
            onChange={(e) => setNewWebhookUrl(e.target.value)}
            required
          />
          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex gap-3">
            <CheckCircle className="text-indigo-400 shrink-0" size={18} />
            <p className="text-xs text-slate-400 leading-relaxed">
              Enviaremos un POST con un payload JSON y una firma HMAC-SHA256 en el header <code className="text-indigo-300">X-Dash-Signature</code>.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" fullWidth onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" fullWidth onClick={handleCreate} disabled={!newWebhookUrl}>
              Crear Webhook
            </Button>
          </div>
        </div>
      </ModalLayout>
    </div>
  );
};

export default WebhooksSettings;
