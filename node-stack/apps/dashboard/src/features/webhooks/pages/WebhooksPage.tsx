import { FC, useState } from "react";
import { Plus, Webhook, ShieldCheck, Terminal } from "lucide-react";
import { Button, Card, EmptyState } from "@node-stack/ui";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useWebhooks, useCreateWebhook, useUpdateWebhook, useDeleteWebhook } from "../../workspaces/hooks/useWebhooks";
import { WebhookList } from "../components/WebhookList";
import { AddWebhookModal } from "../components/AddWebhookModal";

const WebhooksPage: FC = () => {
  const { activeWorkspaceId } = useWorkspaceStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: webhooks, isLoading } = useWebhooks(activeWorkspaceId);
  const createMutation = useCreateWebhook(activeWorkspaceId);
  const updateMutation = useUpdateWebhook(activeWorkspaceId);
  const deleteMutation = useDeleteWebhook(activeWorkspaceId);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <SectionHeader
        title="Webhooks"
        subtitle="Configura endpoints para recibir notificaciones automáticas cuando ocurran eventos en tu espacio."
        action={
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-heading uppercase text-[10px] h-11 px-6 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Endpoint
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!isLoading && webhooks?.length === 0 ? (
            <EmptyState
              title="Sin webhooks configurados"
              description="Empieza a integrar tus sistemas externos mediante notificaciones en tiempo real."
              icon={Webhook}
              action={
                <Button 
                  onClick={() => setIsAddModalOpen(true)}
                  variant="outline"
                  className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  Configurar Webhook
                </Button>
              }
            />
          ) : (
            <WebhookList
              webhooks={webhooks || []}
              isLoading={isLoading}
              onDelete={async (id) => {
                await deleteMutation.mutateAsync(id);
              }}
              onToggle={async (id, enabled) => {
                await updateMutation.mutateAsync({ id, updates: { enabled } });
              }}
            />
          )}
        </div>

        <div className="space-y-8">
          <Card className="p-8 rounded-[32px] border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/5 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm font-heading text-slate-900 dark:text-white uppercase">Seguridad</h3>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-label leading-relaxed">
                Todas las peticiones incluyen un header <code className="text-indigo-600 dark:text-indigo-400 font-mono">X-NodeStack-Signature</code>.
              </p>
              <p className="text-xs text-slate-500 font-label leading-relaxed">
                Utiliza el secreto de cada webhook para validar que la petición proviene realmente de nuestros servidores.
              </p>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[11px] font-heading uppercase text-indigo-600 p-0 h-auto hover:bg-transparent"
                onClick={() => window.open('https://docs.nodestack.com/webhooks', '_blank')}
              >
                Ver guía de firmas <Plus className="ml-1 h-3 w-3 rotate-45" />
              </Button>
            </div>
          </Card>

          <Card className="p-8 rounded-[32px] border-none bg-slate-900 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="p-2.5 bg-white/10 w-fit rounded-xl mb-6">
                <Terminal className="w-5 h-5 text-indigo-400" />
              </div>
              <h4 className="text-sm font-heading uppercase mb-2">Logs de Envío</h4>
              <p className="text-[11px] text-white/50 leading-relaxed mb-6">
                Monitorea el historial de entregas y depura errores de conexión fácilmente.
              </p>
              <Button
                variant="ghost"
                className="w-full rounded-xl bg-white/10 text-white hover:bg-white/20 text-[10px] font-heading uppercase relative z-10"
                disabled
              >
                Próximamente
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <AddWebhookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        isLoading={createMutation.isPending}
        onCreate={async (url, events) => {
          await createMutation.mutateAsync({ url, eventTypes: events });
        }}
      />
    </div>
  );
};

export default WebhooksPage;
