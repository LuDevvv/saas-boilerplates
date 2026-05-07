import { FC } from "react";
import { 
  Card, 
  Button, 
  ConfirmDialog,
  Skeleton
} from "@node-stack/ui";
import { Trash2, Calendar, Clock, Lock } from "lucide-react";
import { useState } from "react";
import type { ApiKey } from "@node-stack/types";

interface ApiKeyListProps {
  keys: ApiKey[];
  isLoading: boolean;
  onRevoke: (id: string) => Promise<void>;
}

export const ApiKeyList: FC<ApiKeyListProps> = ({ keys, isLoading, onRevoke }) => {
  const [revokingId, setRevokingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-[24px]" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {keys.map((key) => (
        <Card key={key.id} className="p-6 rounded-3xl border-border bg-surface/95 shadow-sm group hover:shadow-md transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-canvas border border-border group-hover:scale-110 transition-transform duration-500">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-heading text-fg">{key.name}</h4>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded-md">
                    {key.prefix}••••••••••••
                  </code>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-heading uppercase text-slate-400 flex items-center gap-1.5">
                  <Calendar size={10} /> Creada
                </span>
                <span className="text-xs font-label text-slate-600 dark:text-slate-400">
                  {new Date(key.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-heading uppercase text-slate-400 flex items-center gap-1.5">
                  <Clock size={10} /> Último uso
                </span>
                <span className="text-xs font-label text-slate-600 dark:text-slate-400">
                  {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : "Nunca utilizada"}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
                onClick={() => setRevokingId(key.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </Card>
      ))}

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
