import { FC, useMemo } from "react";
import { Building2, Globe, Hash, Briefcase, MapPin } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { Card } from "@node-stack/ui";
import { useWorkspaces } from "@/features/workspaces/hooks/useWorkspaces";
import { useShallow } from "zustand/react/shallow";
import { appToast } from "@/components/alerts/Toasts";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { InfoItem } from "./InfoItem";
import { KycCard } from "./KycCard";
import { CompanyEditForm } from "./CompanyEditForm";
import { AuditLog } from "./AuditLog";
import { CompanyFormValues } from "../types";

export const CompanyContent: FC = () => {
  const activeWorkspaceId = useWorkspaceStore(useShallow((state) => state.activeWorkspaceId));
  const { data: workspaces } = useWorkspaces();
  
  const activeWorkspace = useMemo(() => 
    workspaces?.find(w => w.id === activeWorkspaceId),
    [workspaces, activeWorkspaceId]
  );

  const handleSave = async (_data: CompanyFormValues) => {
    try {
      // Placeholder for real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      appToast.success({
        title: "Empresa actualizada",
        description: "Los datos legales han sido guardados correctamente."
      });
    } catch (error) {
      appToast.error({
        title: "Error de sincronización",
        description: "No se pudieron actualizar los datos corporativos."
      });
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-full overflow-hidden">
      <SectionHeader 
        badge="Empresa"
        tag="Datos Corporativos"
        title={activeWorkspace?.name || "Empresa Sin Nombre"}
        subtitle="Gestiona la identidad legal, sede social y sectores de actividad de tu organización."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Sidebar Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="card-premium p-5 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-50 dark:border-white/5">
              <h2 className="text-lg font-heading text-gray-950 dark:text-white">Estado Legal</h2>
              <Hash className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-1">
              <InfoItem icon={Building2} label="Tipo" value="Sociedad Limitada" />
              <InfoItem icon={Globe} label="Dominio" value="azteli.com" badge="Verificado" />
              <InfoItem icon={Briefcase} label="Plan" value="Enterprise" badge="Premium" />
              <InfoItem icon={MapPin} label="Región" value="Europa (Madrid)" />
            </div>
          </Card>

          <KycCard />
        </div>

        {/* Form and History */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <CompanyEditForm workspace={activeWorkspace} onSave={handleSave} />
          <AuditLog />
        </div>
      </div>
    </div>
  );
};
