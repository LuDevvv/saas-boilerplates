import { FC, useState } from "react";
import { Zap, Globe, Building2, User, Loader2, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { PageHeader, FilterTabs } from "@node-stack/ui";
import { useFeatureFlags, useToggleFeatureFlag } from "../../hooks";
import { cn } from "@/utils/classNames";

type FlagScope = "all" | "global" | "workspace" | "user";

const SCOPE_FILTERS: { value: FlagScope; label: string; icon: typeof Globe }[] = [
  { value: "all", label: "Todos", icon: Zap },
  { value: "global", label: "Global", icon: Globe },
  { value: "workspace", label: "Workspace", icon: Building2 },
  { value: "user", label: "Usuario", icon: User },
];

const SCOPE_ICONS: Record<string, typeof Globe> = {
  global: Globe,
  workspace: Building2,
  user: User,
};

// ─── Row ─────────────────────────────────────────────────────────────────────

const FlagRow: FC<{
  flag: { key: string; scope: string; scopeId: string | null; enabled: boolean };
  onToggle: (flagKey: string, enabled: boolean, scope: string) => void;
  isToggling: boolean;
}> = ({ flag, onToggle, isToggling }) => {
  const ScopeIcon = SCOPE_ICONS[flag.scope] ?? Globe;

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-border-subtle last:border-0 hover:bg-surface-hover transition-colors group">
      <div className="h-9 w-9 rounded-[10px] bg-surface-muted border border-border-subtle flex items-center justify-center shrink-0">
        <Zap className="h-4 w-4 text-fg-muted" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-mono font-semibold text-fg truncate">{flag.key}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <ScopeIcon className="h-3 w-3 text-fg-muted" />
          <span className="text-[11px] text-fg-muted capitalize">{flag.scope}</span>
          {flag.scopeId && (
            <span className="text-[10px] font-mono text-fg-muted/70 bg-surface-muted border border-border-subtle rounded px-1.5 py-0.5 truncate max-w-[180px]">
              {flag.scopeId}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className={cn(
          "text-[11px] font-semibold uppercase tracking-wide",
          flag.enabled ? "text-emerald-600 dark:text-emerald-400" : "text-fg-muted"
        )}>
          {flag.enabled ? "On" : "Off"}
        </span>
        <button
          onClick={() => onToggle(flag.key, !flag.enabled, flag.scope)}
          disabled={isToggling}
          className="transition-all disabled:opacity-50"
          title={flag.enabled ? "Desactivar" : "Activar"}
        >
          {isToggling ? (
            <Loader2 className="h-5 w-5 animate-spin text-fg-muted" />
          ) : flag.enabled ? (
            <ToggleRight className="h-6 w-6 text-primary" />
          ) : (
            <ToggleLeft className="h-6 w-6 text-fg-muted" />
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export const FeatureFlagsContent: FC = () => {
  const [scopeFilter, setScopeFilter] = useState<FlagScope>("all");
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const { data: flags = [], isLoading, error } = useFeatureFlags();

  const toggle = useToggleFeatureFlag();

  const handleToggle = (flagKey: string, enabled: boolean, scope: string) => {
    setTogglingKey(flagKey);
    toggle.mutate(
      { flagKey, enabled, scope: scope as any },
      { onSettled: () => setTogglingKey(null) }
    );
  };

  const visible = scopeFilter === "all"
    ? flags
    : flags.filter((f) => f.scope === scopeFilter);

  const counts = {
    all: flags.length,
    global: flags.filter((f) => f.scope === "global").length,
    workspace: flags.filter((f) => f.scope === "workspace").length,
    user: flags.filter((f) => f.scope === "user").length,
  };

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      <PageHeader
        eyebrow="ADMIN"
        title="Feature Flags"
        description="Activa o desactiva funcionalidades en tiempo real sin redeploy. Los cambios son inmediatos."
        className="mb-6"
      />

      <div className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border-subtle flex-wrap">
          <FilterTabs
            value={scopeFilter}
            onChange={(v) => setScopeFilter(v as FlagScope)}
            ariaLabel="Filtrar por scope"
            options={SCOPE_FILTERS.map(({ value, label, icon: Icon }) => ({
              value,
              label: `${label} (${counts[value]})`,
              icon: <Icon className="h-3.5 w-3.5" />,
            }))}
          />

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-fg-muted">{flags.filter((f) => f.enabled).length} activos</span>
            <span className="h-2 w-2 rounded-full bg-fg-muted ml-2" />
            <span className="text-[11px] text-fg-muted">{flags.filter((f) => !f.enabled).length} inactivos</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-fg-muted" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 px-5 py-8 text-red-500">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-[13px]">No se pudieron cargar los feature flags.</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center">
            <Zap className="h-8 w-8 text-fg-muted mx-auto mb-3" />
            <p className="text-[14px] font-medium text-fg">Sin flags registrados</p>
            <p className="text-[12px] text-fg-muted mt-1">
              Los flags se crean automáticamente al activarlos por primera vez desde la API.
            </p>
          </div>
        ) : (
          visible.map((flag) => (
            <FlagRow
              key={`${flag.key}:${flag.scope}:${flag.scopeId ?? "global"}`}
              flag={flag}
              onToggle={handleToggle}
              isToggling={togglingKey === flag.key && toggle.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
};
