import { PageHeader, Input, StatusPill, type StatusPillTone } from "@node-stack/ui";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Building2, Users, Crown, Search,
  ChevronLeft, ChevronRight, ExternalLink,
} from "lucide-react";
import { FC, useState } from "react";

import { WorkspacesAdminSkeleton } from "@/features/admin/components/AdminSkeletons";
import { api } from "@/lib/api";
import { cn } from "@/utils/classNames";


const TIER_TONE: Record<string, StatusPillTone> = {
  free: "neutral",
  pro: "info",
  enterprise: "success",
};

// ─── Row ─────────────────────────────────────────────────────────────────────

const WorkspaceRow: FC<{
  ws: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    tier: string;
    memberCount: number;
    deletedAt?: string | null;
    createdAt: string;
  };
}> = ({ ws }) => {
  const isDeleted = !!ws.deletedAt;

  return (
    <tr className={cn("border-b border-border-subtle hover:bg-surface-hover transition-colors", isDeleted && "opacity-50")}>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-[10px] bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 font-heading text-primary text-[14px]">
            {ws.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-fg truncate">{ws.name}</p>
            <p className="text-[11px] text-fg-muted font-mono">/{ws.slug}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <StatusPill
          label={ws.tier.toUpperCase()}
          tone={TIER_TONE[ws.tier] ?? "neutral"}
        />
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5 text-[13px] text-fg-secondary">
          <Users className="h-3.5 w-3.5 text-fg-muted" />
          {ws.memberCount}
        </div>
      </td>

      <td className="px-5 py-4 text-[12px] text-fg-muted font-mono">
        {format(new Date(ws.createdAt), "dd/MM/yyyy")}
      </td>

      <td className="px-5 py-4">
        {isDeleted ? (
          <StatusPill label="Eliminado" tone="warning" />
        ) : (
          <StatusPill label="Activo" tone="success" />
        )}
      </td>

      <td className="px-5 py-4">
        <a
          href={`/admin/workspaces/${ws.id}`}
          className="h-7 w-7 rounded-md text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors flex items-center justify-center"
          title="Ver detalle"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </td>
    </tr>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export const WorkspacesAdminContent: FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "workspaces", page, includeDeleted],
    queryFn: () => api.admin.listWorkspaces({ page, limit: 20, includeDeleted }),
  });

  const workspaces = data?.data ?? [];
  const meta = data?.meta;

  const filtered = search.trim()
    ? workspaces.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ws: any) =>
          ws.name.toLowerCase().includes(search.toLowerCase()) ||
          ws.slug.toLowerCase().includes(search.toLowerCase())
      )
    : workspaces;

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="ADMIN"
        title="Workspaces"
        description="Vista global de todos los workspaces de la plataforma."
        className="mb-6"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: meta?.total ?? "—", icon: Building2, color: "text-primary bg-primary/10" },
          { label: "Esta página", value: workspaces.length, icon: Building2, color: "text-fg-secondary bg-surface-muted" },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { label: "Con miembros", value: workspaces.filter((w: any) => w.memberCount > 0).length, icon: Users, color: "text-emerald-600 bg-emerald-500/10" },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { label: "Pro/Enterprise", value: workspaces.filter((w: any) => w.tier !== "free").length, icon: Crown, color: "text-amber-600 bg-amber-500/10" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-[16px] border border-border bg-surface p-4 flex items-center gap-3">
            <div className={cn("h-9 w-9 rounded-[10px] flex items-center justify-center shrink-0", color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[20px] font-heading text-fg leading-none">{value}</p>
              <p className="text-[11px] text-fg-muted mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)]">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border-subtle flex-wrap">
          <div className="w-full sm:w-[280px]">
            <Input
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o slug..."
              className="h-9 rounded-xl text-[13px]"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none text-[13px] text-fg-secondary">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => { setIncludeDeleted(e.target.checked); setPage(1); }}
              className="rounded border-border"
            />
            Incluir eliminados
          </label>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-5"><WorkspacesAdminSkeleton /></div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
            <div className="h-10 w-10 rounded-[14px] bg-surface-muted border border-border flex items-center justify-center">
              <Building2 className="h-5 w-5 text-fg-muted" />
            </div>
            <p className="text-[14px] font-semibold text-fg">Sin conexión con el API</p>
            <p className="text-[12px] text-fg-muted max-w-xs">
              Verifica que el servidor esté en marcha y que tengas permisos de administrador.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
            <div className="h-10 w-10 rounded-[14px] bg-surface-muted border border-border flex items-center justify-center">
              <Building2 className="h-5 w-5 text-fg-muted" />
            </div>
            <p className="text-[14px] font-semibold text-fg">Sin workspaces</p>
            <p className="text-[12px] text-fg-muted">Aún no se ha creado ningún workspace en la plataforma.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  {["Workspace", "Plan", "Miembros", "Creado", "Estado", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {filtered.map((ws: any) => (
                  <WorkspaceRow key={ws.id} ws={ws} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border-subtle">
            <p className="text-[12px] text-fg-muted">
              Página {meta.page} de {meta.pages} · {meta.total} workspaces
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 rounded-lg border border-border text-fg-muted hover:text-fg hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                disabled={page === meta.pages}
                className="h-8 w-8 rounded-lg border border-border text-fg-muted hover:text-fg hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
