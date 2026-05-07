import { Calendar, Edit3, Building2, Loader2 } from "lucide-react";
import { Button, Badge, HeroHeader, ProfileAvatar } from "@node-stack/ui";
import { formatEntityDate } from "@node-stack/utils";
import { appToast } from "@components/alerts/Toasts";
import { FC } from "react";
import { useUploadFile } from "@/features/storage/hooks/useStorage";
import { useUpdateWorkspace } from "@/features/workspaces/hooks/useWorkspaces";

interface CompanyHeroProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  workspace?: any;
  isPending?: boolean;
}

export const CompanyHero: FC<CompanyHeroProps> = ({ isEditing, onToggleEdit, workspace, isPending: isUpdatingInfo }) => {
  const { upload, isUploading } = useUploadFile(workspace?.id);
  const { mutateAsync: updateWorkspace, isPending: isUpdatingLogo } = useUpdateWorkspace();

  const handleLogoChange = async (file: File | null) => {
    if (!file || !workspace?.id) return;

    try {
      const { fileUrl } = await upload(file);
      await updateWorkspace({
        workspaceId: workspace.id,
        data: {
          logoUrl: fileUrl
        }
      });
      appToast.success({
        title: "Logo actualizado",
        description: "El logo de la compañía se ha guardado correctamente."
      });
    } catch (error) {
      // Handled by hook
    }
  };

  const isLoading = isUpdatingInfo || isUpdatingLogo || isUploading;
  return (
    <HeroHeader
      title={workspace?.name || "Compañía"}
      actionsOutside={true}
      subtitle={
        <>
          <div className="flex items-center gap-1.5 shrink-0">
            <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Entidad Corporativa</span>
          </div>
          <span className="hidden sm:inline opacity-30 mx-1">•</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Desde {formatEntityDate(workspace?.createdAt)}</span>
          </div>
        </>
      }
      avatar={
        <ProfileAvatar 
          src={workspace?.logoUrl} 
          fallback={workspace?.name || "C"}
          size="lg"
          isUploading={isUploading}
          onImageChange={handleLogoChange}
          onError={(err) => appToast.error(err)}
        />
      }
      badge={
        <Badge className="bg-white/15 text-white border border-white/25 dark:bg-primary/15 dark:text-primary dark:border-primary/25 text-[10px] font-bold uppercase py-1 px-3 rounded-full shrink-0">
          Verificado
        </Badge>
      }
      actions={
        <Button
          variant={isEditing ? "secondary" : "outline"}
          onClick={onToggleEdit}
          disabled={isLoading}
          className="rounded-xl h-11 w-full sm:w-auto px-8 flex items-center justify-center gap-2 font-bold uppercase text-[11px] shadow-none active:scale-95 transition-colors
            text-white dark:text-fg
            bg-primary sm:bg-white/10 dark:bg-primary/15 dark:sm:bg-primary/15
            border-white/20 dark:border-primary/25
            hover:bg-primary-600 sm:hover:bg-white/20 dark:hover:bg-primary/25"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEditing ? (
            <>Cancelar Edición</>
          ) : (
            <>
              <Edit3 className="h-4 w-4" />
              Configurar Compañía
            </>
          )}
        </Button>
      }
    />
  );
};
