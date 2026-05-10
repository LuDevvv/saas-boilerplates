import { PageHeader } from "@node-stack/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, RefreshCw, Loader2, Plus, Pencil, X, Check } from "lucide-react";
import { FC, useState } from "react";

import { appToast } from "@/components/alerts/Toasts";
import { api } from "@/lib/api";
import { cn } from "@/utils/classNames";

// ─── Row ─────────────────────────────────────────────────────────────────────

const ConfigRow: FC<{
  configKey: string;
  value: unknown;
  onSave: (key: string, value: unknown) => void;
  isSaving: boolean;
}> = ({ configKey, value, onSave, isSaving }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(JSON.stringify(value, null, 2));

  const handleSave = () => {
    try {
      const parsed = JSON.parse(draft);
      onSave(configKey, parsed);
      setEditing(false);
    } catch {
      appToast.error({ title: "JSON inválido", description: "El valor debe ser JSON válido." });
    }
  };

  return (
    <div className="group border-b border-border-subtle last:border-0 px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-mono font-semibold text-primary">{configKey}</p>
          {editing ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={Math.max(2, draft.split("\n").length)}
              className="mt-2 w-full rounded-[10px] border border-border bg-canvas px-3 py-2 font-mono text-[12px] text-fg resize-y focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25"
            />
          ) : (
            <p className="mt-0.5 text-[12px] font-mono text-fg-muted truncate">
              {JSON.stringify(value)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="h-7 w-7 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex items-center justify-center"
                title="Guardar"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => { setEditing(false); setDraft(JSON.stringify(value, null, 2)); }}
                className="h-7 w-7 rounded-md text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors flex items-center justify-center"
                title="Cancelar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="h-7 w-7 rounded-md text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
              title="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Add Config Modal ─────────────────────────────────────────────────────────

const AddConfigForm: FC<{
  onSave: (key: string, value: unknown, description?: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}> = ({ onSave, onCancel, isSaving }) => {
  const [key, setKey] = useState("");
  const [value, setValue] = useState('""');
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) { appToast.error({ title: "Key requerida" }); return; }
    try {
      const parsed = JSON.parse(value);
      onSave(key.trim(), parsed, description || undefined);
    } catch {
      appToast.error({ title: "JSON inválido", description: "El valor debe ser JSON válido." });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-[14px] border border-primary/20 bg-primary/[0.04] p-4 flex flex-col gap-3">
      <p className="text-[13px] font-semibold text-fg">Nueva entrada de configuración</p>
      <input
        placeholder="config.key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        className="h-9 rounded-[10px] border border-border bg-canvas px-3 font-mono text-[13px] text-fg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25"
      />
      <textarea
        placeholder='Valor (JSON): "string" | 42 | true | {}'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        className="rounded-[10px] border border-border bg-canvas px-3 py-2 font-mono text-[12px] text-fg resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25"
      />
      <input
        placeholder="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="h-9 rounded-[10px] border border-border bg-canvas px-3 text-[13px] text-fg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={isSaving} className="h-8 px-4 rounded-[10px] bg-primary text-primary-foreground text-[12px] font-semibold disabled:opacity-60 flex items-center gap-1.5">
          {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
          Guardar
        </button>
        <button type="button" onClick={onCancel} className="h-8 px-4 rounded-[10px] border border-border text-[12px] font-semibold text-fg-secondary hover:bg-surface-hover">
          Cancelar
        </button>
      </div>
    </form>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export const SystemConfigContent: FC = () => {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const { data: config, isLoading, error } = useQuery({
    queryKey: ["admin", "config"],
    queryFn: async () => {
      const data = await api.admin.getAllConfig();
      return data ?? {};
    },
    retry: 1,
  });

  const setConfig = useMutation({
    mutationFn: (payload: { key: string; value: unknown; description?: string }) =>
      api.admin.setConfig(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "config"] });
      appToast.success({ title: "Configuración guardada" });
      setSavingKey(null);
    },
    onError: () => {
      appToast.error({ title: "Error", description: "No se pudo guardar la configuración." });
      setSavingKey(null);
    },
  });

  const refreshCache = useMutation({
    mutationFn: () => api.admin.refreshConfigCache(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "config"] });
      appToast.success({ title: "Caché refrescado", description: "La configuración se recargó desde la base de datos." });
    },
  });

  const handleSave = (key: string, value: unknown, description?: string) => {
    setSavingKey(key);
    setConfig.mutate({ key, value, description });
  };

  const entries = config ? Object.entries(config as Record<string, unknown>) : [];

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      <PageHeader
        eyebrow="ADMIN"
        title="Configuración del Sistema"
        description="Gestiona parámetros dinámicos de la plataforma sin necesidad de redeploy."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdding((v) => !v)}
              className="h-9 px-4 rounded-xl border border-border bg-surface text-[13px] font-medium text-fg-secondary hover:bg-surface-hover hover:text-fg transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva clave
            </button>
            <button
              onClick={() => refreshCache.mutate()}
              disabled={refreshCache.isPending}
              className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium flex items-center gap-1.5 disabled:opacity-60 transition-all hover:opacity-90"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshCache.isPending && "animate-spin")} />
              Refrescar caché
            </button>
          </div>
        }
        className="mb-6"
      />

      <div className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
          <div className="h-8 w-8 rounded-[10px] bg-primary/10 flex items-center justify-center">
            <Settings className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-fg">Parámetros activos</p>
            <p className="text-[11px] text-fg-muted">{entries.length} entradas · Caché TTL 1h</p>
          </div>
        </div>

        {adding && (
          <div className="px-5">
            <AddConfigForm
              onSave={(key, value, desc) => { handleSave(key, value, desc); setAdding(false); }}
              onCancel={() => setAdding(false)}
              isSaving={setConfig.isPending}
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-fg-muted" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
            <div className="h-10 w-10 rounded-[14px] bg-surface-muted border border-border flex items-center justify-center">
              <Settings className="h-5 w-5 text-fg-muted" />
            </div>
            <p className="text-[14px] font-semibold text-fg">Sin conexión con el API</p>
            <p className="text-[12px] text-fg-muted max-w-xs">
              La configuración se lee desde la base de datos. Verifica que el servidor esté en marcha.
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
            <div className="h-10 w-10 rounded-[14px] bg-surface-muted border border-border flex items-center justify-center">
              <Settings className="h-5 w-5 text-fg-muted" />
            </div>
            <p className="text-[14px] font-semibold text-fg">Sin parámetros configurados</p>
            <p className="text-[12px] text-fg-muted max-w-xs">
              Añade tu primera entrada de configuración usando el botón "Nueva clave".
            </p>
          </div>
        ) : (
          entries.map(([key, value]) => (
            <ConfigRow
              key={key}
              configKey={key}
              value={value}
              onSave={handleSave}
              isSaving={savingKey === key && setConfig.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
};
