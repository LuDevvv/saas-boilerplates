import { FC, useState } from "react";
import { Plus, Key, Terminal, Code2 } from "lucide-react";
import { Button, Card, EmptyState } from "@node-stack/ui";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "../../workspaces/hooks/useApiKeys";
import { ApiKeyList } from "../components/ApiKeyList";
import { CreateKeyDialog } from "../components/CreateKeyDialog";

const ApiKeysPage: FC = () => {
  const { activeWorkspaceId } = useWorkspaceStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: keys, isLoading } = useApiKeys(activeWorkspaceId);
  const createMutation = useCreateApiKey(activeWorkspaceId);
  const revokeMutation = useRevokeApiKey(activeWorkspaceId);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <SectionHeader
        title="Claves API"
        subtitle="Gestiona las claves de acceso para integrar tus aplicaciones con nuestra API."
        action={
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-heading uppercase text-[10px] h-11 px-6 shadow-lg shadow-cyan-600/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Clave
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!isLoading && keys?.length === 0 ? (
            <EmptyState
              title="Sin claves API"
              description="Genera tu primera clave para empezar a realizar peticiones autenticadas."
              icon={Key}
              action={
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  variant="outline"
                  className="rounded-xl border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                >
                  Crear Clave
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
        </div>

        <div className="space-y-8">
          <Card className="p-8 rounded-[32px] border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-cyan-50 dark:bg-cyan-500/5 rounded-xl">
                <Terminal className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-sm font-heading text-slate-900 dark:text-white uppercase">Guía de Inicio</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-300 font-mono text-[10px] leading-relaxed border border-slate-800">
                <p className="text-cyan-400 mb-2"># Ejemplo de uso</p>
                curl https://api.nodestack.com/v1/me \<br/>
                &nbsp;&nbsp;-H "Authorization: Bearer <span className="text-white">YOUR_API_KEY</span>"
              </div>
              <p className="text-xs text-slate-500 font-label leading-relaxed">
                Utiliza tus claves API en el header de Authorization para autenticar tus peticiones desde servidores externos.
              </p>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[11px] font-heading uppercase text-cyan-600 p-0 h-auto hover:bg-transparent"
                onClick={() => window.open('https://docs.nodestack.com', '_blank')}
              >
                Ver documentación <Plus className="ml-1 h-3 w-3 rotate-45" />
              </Button>
            </div>
          </Card>

          <Card className="p-8 rounded-[32px] border-none bg-slate-900 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="p-2.5 bg-white/10 w-fit rounded-xl mb-6">
                <Code2 className="w-5 h-5 text-cyan-400" />
              </div>
              <h4 className="text-sm font-heading uppercase mb-2">SDKs Oficiales</h4>
              <p className="text-[11px] text-white/50 leading-relaxed mb-6">
                Integra más rápido utilizando nuestros SDKs para Node.js, Python y Go.
              </p>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-[10px] font-bold">JS</div>
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-[10px] font-bold">PY</div>
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-[10px] font-bold">GO</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

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
