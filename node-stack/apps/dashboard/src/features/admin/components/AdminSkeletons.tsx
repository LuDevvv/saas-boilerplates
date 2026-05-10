import { Skeleton } from "@node-stack/ui";
import { FC } from "react";

// ─── Shared atoms ─────────────────────────────────────────────────────────────

const SectionCardSkeleton: FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)]">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
      <Skeleton className="h-8 w-8 rounded-[10px]" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-2.5 w-20" />
      </div>
    </div>
    <div className="p-5 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-2 w-2 rounded-full shrink-0" />
            <Skeleton className="h-3 rounded-md" style={{ width: `${60 + (i * 15) % 30}%` }} />
          </div>
          <Skeleton className="h-3 w-8 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

// ─── 1. Centro de Control (Sistema/Overview) ──────────────────────────────────

export const ControlCenterSkeleton: FC = () => (
  <div className="space-y-6 w-full">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-3 w-16 rounded-md" />
      <Skeleton className="h-8 w-56 rounded-xl" />
      <Skeleton className="h-3.5 w-96 rounded-md" />
    </div>

    {/* KPI strip */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-[20px] border border-border bg-surface p-5 space-y-4">
          <div className="flex items-start justify-between">
            <Skeleton className="h-10 w-10 rounded-[12px]" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-2.5 w-24 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-2.5 w-32 rounded-md" />
          </div>
        </div>
      ))}
    </div>

    {/* Charts row */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-[10px]" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-2.5 w-24" />
              </div>
            </div>
            <div className="flex gap-1">
              {[1,2,3,4].map(j => <Skeleton key={j} className="h-6 w-8 rounded-lg" />)}
            </div>
          </div>
          <div className="p-5">
            <Skeleton className="h-[200px] w-full rounded-[12px]" />
          </div>
        </div>
      ))}
    </div>

    {/* Activity full width */}
    <div className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
        <Skeleton className="h-8 w-8 rounded-[10px]" />
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-48" />
          <Skeleton className="h-2.5 w-32" />
        </div>
      </div>
      <div className="p-5">
        <Skeleton className="h-[160px] w-full rounded-[12px]" />
      </div>
    </div>

    {/* Breakdown grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <SectionCardSkeleton key={i} rows={4} />
      ))}
    </div>

    {/* Bottom row */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <SectionCardSkeleton key={i} rows={3} />
      ))}
    </div>
  </div>
);

// ─── 2. Gestión de Usuarios ────────────────────────────────────────────────────

export const ManageUsersSkeleton: FC = () => (
  <div className="space-y-6 w-full">
    {/* Header */}
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="h-8 w-52 rounded-xl" />
        <Skeleton className="h-3.5 w-80 rounded-md" />
      </div>
      <div className="flex gap-2 shrink-0">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
    </div>

    {/* Table card */}
    <div className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)] overflow-hidden">
      {/* Toolbar */}
      <div className="p-6 border-b border-border-subtle flex gap-4">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      {/* Rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border-subtle last:border-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Skeleton className="h-10 w-10 rounded-2xl shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-3.5 w-36 rounded-md" />
              <Skeleton className="h-2.5 w-48 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          <Skeleton className="h-3.5 w-24 rounded-md shrink-0" />
          <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
        </div>
      ))}
      {/* Footer */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-border-subtle">
        <Skeleton className="h-3.5 w-40 rounded-md" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

// ─── 3. Workspaces Admin ──────────────────────────────────────────────────────

export const WorkspacesAdminSkeleton: FC = () => (
  <div className="space-y-6 w-full">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-3 w-16 rounded-md" />
      <Skeleton className="h-8 w-44 rounded-xl" />
      <Skeleton className="h-3.5 w-72 rounded-md" />
    </div>

    {/* Summary cards */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-[16px] border border-border bg-surface p-4 flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-[10px] shrink-0" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-10 rounded-md" />
            <Skeleton className="h-2.5 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>

    {/* Table */}
    <div className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border-subtle">
        <Skeleton className="h-9 w-[280px] rounded-xl" />
        <Skeleton className="h-5 w-36 rounded-md" />
      </div>
      {/* Header row */}
      <div className="grid grid-cols-6 gap-4 px-5 py-3 border-b border-border-subtle">
        {["Workspace", "Plan", "Miembros", "Creado", "Estado", ""].map((_, i) => (
          <Skeleton key={i} className="h-2.5 w-16 rounded-md" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="grid grid-cols-6 gap-4 items-center px-5 py-4 border-b border-border-subtle last:border-0">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-[10px] shrink-0" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-2.5 w-16 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-3.5 w-8 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-md ml-auto" />
        </div>
      ))}
    </div>
  </div>
);

// ─── 4. Registro de Auditoría ─────────────────────────────────────────────────

export const AuditLogsSkeleton: FC = () => (
  <div className="space-y-6 w-full">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-3 w-16 rounded-md" />
      <Skeleton className="h-8 w-60 rounded-xl" />
      <Skeleton className="h-3.5 w-96 rounded-md" />
    </div>

    {/* Card */}
    <div className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-3.5 w-20 rounded-md" />
      </div>
      {/* Log rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-5 py-3.5 border-b border-border-subtle last:border-0">
          <Skeleton className="h-8 w-8 rounded-[10px] shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 rounded-md" style={{ width: `${80 + (i * 23) % 100}px` }} />
              {i % 3 === 0 && <Skeleton className="h-4 w-20 rounded-md" />}
            </div>
            <Skeleton className="h-2.5 w-48 rounded-md" />
          </div>
          <div className="text-right shrink-0 space-y-1">
            <Skeleton className="h-3 w-12 rounded-md" />
            <Skeleton className="h-2.5 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── 5. Feature Flags ─────────────────────────────────────────────────────────

export const FeatureFlagsSkeleton: FC = () => (
  <div className="space-y-6 w-full">
    {/* Header */}
    <div className="space-y-2">
      <Skeleton className="h-3 w-16 rounded-md" />
      <Skeleton className="h-8 w-40 rounded-xl" />
      <Skeleton className="h-3.5 w-80 rounded-md" />
    </div>

    {/* Card */}
    <div className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)]">
      {/* Filter tabs */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-lg" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
      </div>
      {/* Flag rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border-subtle last:border-0">
          <Skeleton className="h-9 w-9 rounded-[10px] shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 rounded-md" style={{ width: `${100 + (i * 40) % 120}px` }} />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-2.5 w-12 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Skeleton className="h-3 w-5 rounded-md" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── 6. Configuración del Sistema ─────────────────────────────────────────────

export const SystemConfigSkeleton: FC = () => (
  <div className="space-y-6 w-full">
    {/* Header */}
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-3.5 w-80 rounded-md" />
      </div>
      <div className="flex gap-2 shrink-0">
        <Skeleton className="h-9 w-32 rounded-xl" />
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>
    </div>

    {/* Config card */}
    <div className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)]">
      {/* Card header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
        <Skeleton className="h-8 w-8 rounded-[10px]" />
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-2.5 w-28" />
        </div>
      </div>
      {/* Config rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-5 py-4 border-b border-border-subtle last:border-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className="h-3.5 rounded-md" style={{ width: `${80 + (i * 35) % 120}px` }} />
              <Skeleton className="h-3 rounded-md" style={{ width: `${120 + (i * 55) % 160}px` }} />
            </div>
            <Skeleton className="h-7 w-7 rounded-md shrink-0" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
