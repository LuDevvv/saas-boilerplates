import { FC, useState } from "react";
import { Plus, Key, Terminal, Code2 } from "lucide-react";
import {
  Button,
  CalloutCard,
  EmptyState,
  PageHeader,
  TwoColumnLayout,
} from "@node-stack/ui";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
} from "../../workspaces/hooks/useApiKeys";
import { ApiKeyList } from "../components/ApiKeyList";
import { CreateKeyDialog } from "../components/CreateKeyDialog";

const ApiKeysPage: FC = () => {
  const { activeWorkspaceId } = useWorkspaceStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: keys, isLoading } = useApiKeys(activeWorkspaceId);
  const createMutation = useCreateApiKey(activeWorkspaceId);
  const revokeMutation = useRevokeApiKey(activeWorkspaceId);

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      <PageHeader
        eyebrow="WORKSPACE"
        title="Claves API"
        description="Gestiona credenciales programáticas, monitorea su uso y rota antes de la fecha de expiración."
        action={
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-xl bg-primary hover:bg-primary-600 px-5 h-10 text-[13px] font-medium text-primary-foreground transition-all active:scale-95 shadow-[0_4px_14px_-2px_rgba(0,64,128,0.20)] dark:shadow-[0_4px_14px_-2px_rgba(91,168,229,0.20)]"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva clave
          </Button>
        }
        className="mb-6"
      />

      <TwoColumnLayout>
        <TwoColumnLayout.Main>
          {!isLoading && keys?.length === 0 ? (
            <EmptyState
              title="Sin claves API"
              description="Genera tu primera clave para empezar a realizar peticiones autenticadas."
              icon={Key}
              action={
                <Button onClick={() => setIsCreateModalOpen(true)} variant="outline" className="rounded-xl">
                  Crear clave
                </Button>
              }
            />
          ) : (
            <ApiKeyList
              keys={keys || []}
              isLoading={isLoading}
              onRevoke={async (id) => {
                await revokeMutation.mutateAsync(id);
              }}
            />
          )}
        </TwoColumnLayout.Main>

        <TwoColumnLayout.Aside className="flex flex-col gap-4">
          {/* Quick start */}
          <div className="rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-[10px] bg-primary/10 border border-primary/15 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-[13px] font-semibold text-fg uppercase tracking-wider">
                Quick start
              </h3>
            </div>
            <pre className="bg-surface-elevated border border-border rounded-xl p-3 text-[11px] font-mono text-fg-secondary overflow-x-auto custom-scrollbar leading-relaxed">
              <code>
                <span className="text-fg-muted"># Ejemplo de uso</span>
                {"\n"}
                <span className="text-emerald-600 dark:text-emerald-400">curl</span> https://api.nodestack.com/v1/me \{"\n"}
                {"  "}
                <span className="text-blue-600 dark:text-blue-400">-H</span>{" "}
                <span className="text-amber-600 dark:text-amber-400">"Authorization: Bearer </span>
                <span className="text-fg">YOUR_API_KEY</span>
                <span className="text-amber-600 dark:text-amber-400">"</span>
              </code>
            </pre>
            <p className="text-[11px] text-fg-secondary leading-relaxed mt-3">
              Usa el header <code className="text-primary font-mono">Authorization</code> para
              autenticar peticiones desde servidores externos.
            </p>
            <Button
              variant="ghost"
              className="mt-3 w-full justify-start text-[11px] font-bold uppercase tracking-wider text-primary p-0 h-auto hover:bg-transparent"
              onClick={() => window.open("https://docs.nodestack.com", "_blank")}
            >
              Ver documentación →
            </Button>
          </div>

          <CalloutCard
            icon={Code2}
            iconTone="primary"
            variant="muted"
            eyebrow="OFICIALES"
            title="SDKs disponibles"
            description="Integra más rápido con SDKs para Node.js, Python y Go. Soporte oficial y type-safe."
            action={
              <div className="flex gap-2">
                {["JS", "PY", "GO"].map((lang) => (
                  <span
                    key={lang}
                    className="h-8 w-8 rounded-lg bg-surface border border-border flex items-center justify-center text-[10px] font-bold text-fg-secondary tracking-wider"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            }
          />
        </TwoColumnLayout.Aside>
      </TwoColumnLayout>

      <CreateKeyDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        isLoading={createMutation.isPending}
        onCreate={async (name) => {
          return await createMutation.mutateAsync(name);
        }}
      />
    </div>
  );
};

export default ApiKeysPage;
