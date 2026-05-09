import { appToast } from "@components/alerts/Toasts";
import { CalloutCard, Card, InfoItem } from "@node-stack/ui";
import { Building2, Hash, AlignLeft, ShieldCheck, Calendar } from "lucide-react";
import { FC, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { AuditLog } from "./AuditLog";
import { CompanyEditForm } from "./CompanyEditForm";
import { CompanyHero } from "./CompanyHero";
import { KycCard } from "./KycCard";
import { CompanyFormValues } from "../types";

import { useWorkspaces, useUpdateWorkspace } from "@/features/workspaces/hooks/useWorkspaces";
import { useWorkspaceStore } from "@/stores/workspaceStore";


export const CompanyContent: FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const activeWorkspaceId = useWorkspaceStore(useShallow((state) => state.activeWorkspaceId));
  const { data: workspaces, isLoading } = useWorkspaces();
  const { mutateAsync: updateWorkspace, isPending } = useUpdateWorkspace();

  const activeWorkspace = useMemo(() =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    workspaces?.find((w: any) => w.id === activeWorkspaceId),
    [workspaces, activeWorkspaceId]
  );

  const handleSave = async (data: CompanyFormValues) => {
    if (!activeWorkspaceId) {
      appToast.error("No hay una compañía activa.");
      return;
    }
    try {
      await updateWorkspace({
        workspaceId: activeWorkspaceId,
        data: {
          name: data.name,
          description: data.description || undefined,
        },
      });
      setIsEditing(false);
    } catch {
      // Error handled by hook
    }
  };

  const formattedDate = activeWorkspace?.createdAt
    ? new Date(activeWorkspace.createdAt).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="space-y-5 pb-20 w-full">
      <CompanyHero
        workspace={activeWorkspace}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing(!isEditing)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {isEditing ? (
            <CompanyEditForm
              workspace={activeWorkspace}
              onSave={handleSave}
              isPending={isPending}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <Card className="card-premium p-6 relative overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 mb-8 pb-5 border-b border-border-subtle">
                <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-fg uppercase">
                    Detalles de la Compañía
                  </h3>
                  <p className="text-[10px] font-medium text-slate-400 uppercase mt-0.5">
                    Identidad & Configuración
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-100 dark:bg-white/5 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem
                    icon={Building2}
                    label="Razón Social"
                    value={activeWorkspace?.name || "—"}
                  />
                  <InfoItem
                    icon={Hash}
                    label="Identificador (Slug)"
                    value={activeWorkspace?.slug || "—"}
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Creado el"
                    value={formattedDate}
                  />
                  <InfoItem
                    icon={ShieldCheck}
                    label="Rol en la compañía"
                    value={activeWorkspace?.role ? activeWorkspace.role.charAt(0).toUpperCase() + activeWorkspace.role.slice(1) : "—"}
                  />
                  {activeWorkspace?.description && (
                    <div className="md:col-span-2">
                      <InfoItem
                        icon={AlignLeft}
                        label="Descripción"
                        value={activeWorkspace.description}
                      />
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          <div>
            <AuditLog />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-5 sticky top-24">
          <KycCard />

          <div className="rounded-[20px] bg-surface p-6 border border-border shadow-[var(--shadow-card)]">
            <h3 className="text-[13px] font-bold text-fg mb-4 uppercase">
              Estado de la Compañía
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-muted border border-border-subtle">
                <span className="text-[10px] font-bold text-fg-muted uppercase">Estado</span>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase px-2 py-0.5 bg-emerald-500/10 rounded-md">
                  Activo
                </span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-muted border border-border-subtle">
                <span className="text-[10px] font-bold text-fg-muted uppercase">Nivel de Plan</span>
                <span className="text-[9px] font-bold text-primary uppercase px-2 py-0.5 bg-primary/10 rounded-md">
                  Enterprise
                </span>
              </div>
            </div>
          </div>

          <CalloutCard
            icon={ShieldCheck}
            iconTone="primary"
            variant="card"
            title="Seguridad SOC2"
            description="Protocolos de auditoría corporativa activos y monitoreados."
          />
        </div>
      </div>
    </div>
  );
};
