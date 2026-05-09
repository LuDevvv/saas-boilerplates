import { FC, useState } from "react";
import { Plus, Webhook, ShieldCheck, Terminal } from "lucide-react";
import {
  Button,
  CalloutCard,
  EmptyState,
  PageHeader,
  SectionHeader,
  TwoColumnLayout,
} from "@node-stack/ui";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import {
  useWebhooks,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
} from "../../workspaces/hooks/useWebhooks";
import { WebhookList } from "../components/WebhookList";
import { WebhookEventsLog } from "../components/WebhookEventsLog";
import { AddWebhookModal } from "../components/AddWebhookModal";

const WebhooksPage: FC = () => {
  const { activeWorkspaceId } = useWorkspaceStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: webhooks, isLoading } = useWebhooks(activeWorkspaceId);
  const createMutation = useCreateWebhook(activeWorkspaceId);
  const updateMutation = useUpdateWebhook(activeWorkspaceId);
  const deleteMutation = useDeleteWebhook(activeWorkspaceId);

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      <PageHeader
        eyebrow="WORKSPACE"
        title="Webhooks"
        description="Configura endpoints para recibir notificaciones automáticas e inspecciona el historial de entregas."
        action={
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-xl bg-primary hover:bg-primary-600 px-5 h-10 text-[13px] font-medium text-primary-foreground transition-all active:scale-95 shadow-[0_4px_14px_-2px_rgba(0,64,128,0.20)] dark:shadow-[0_4px_14px_-2px_rgba(91,168,229,0.20)]"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Agregar endpoint
          </Button>
        }
        className="mb-6"
      />

      <TwoColumnLayout>
        <TwoColumnLayout.Main className="flex flex-col gap-6">
          <div className="space-y-3">
            <SectionHeader
              eyebrow="ENDPOINTS"
              title="Tus webhooks"
              description="Endpoints registrados que reciben eventos en tiempo real."
            />
            {!isLoading && webhooks?.length === 0 ? (
              <EmptyState
                title="Sin webhooks configurados"
                description="Empieza a integrar tus sistemas externos mediante notificaciones en tiempo real."
                icon={Webhook}
                action={
                  <Button onClick={() => setIsAddModalOpen(true)} variant="outline" className="rounded-xl">
                    Configurar webhook
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
                  await updateMutation.mutateAsync({ id, enabled });
                }}
              />
            )}
          </div>

          <div className="space-y-3">
            <SectionHeader
              eyebrow="DELIVERIES"
              title="Historial de eventos"
              description="Inspecciona payloads, reintentos y reenvía manualmente eventos fallidos."
            />
            <WebhookEventsLog />
          </div>
        </TwoColumnLayout.Main>

        <TwoColumnLayout.Aside className="flex flex-col gap-4">
          <CalloutCard
            icon={ShieldCheck}
            iconTone="success"
            variant="card"
            eyebrow="SEGURIDAD"
            title="Firmas HMAC"
            description="Todas las peticiones incluyen el header X-NodeStack-Signature. Usa el secreto del webhook para validar la integridad."
            action={
              <Button
                variant="ghost"
                className="w-full justify-start text-[11px] font-bold uppercase tracking-wider text-primary p-0 h-auto hover:bg-transparent"
                onClick={() => window.open("https://docs.nodestack.com/webhooks", "_blank")}
              >
                Ver guía de firmas →
              </Button>
            }
          />

          <CalloutCard
            icon={Terminal}
            iconTone="primary"
            variant="muted"
            eyebrow="DEBUGGING"
            title="Inspecciona payloads"
            description="Haz click en cualquier entrega del log para ver el JSON enviado, la respuesta y reenviar manualmente si falló."
          />
        </TwoColumnLayout.Aside>
      </TwoColumnLayout>

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
