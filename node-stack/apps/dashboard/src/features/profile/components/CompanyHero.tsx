import { appToast } from "@components/alerts/Toasts";
import { Button, Badge, HeroHeader, ProfileAvatar } from "@node-stack/ui";
import { formatEntityDate } from "@node-stack/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, Edit3, Building2 } from "lucide-react";
import { FC, useState } from "react";


import { useUploadFile } from "@/features/storage/hooks/useStorage";
import { useUpdateWorkspace } from "@/features/workspaces/hooks/useWorkspaces";
import { api } from "@/lib/api";

interface CompanyHeroProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  workspace?: Record<string, unknown>;
  isPending?: boolean;
}

export const CompanyHero: FC<CompanyHeroProps> = ({ isEditing, onToggleEdit, workspace, isPending: isUpdatingInfo }) => {
  const workspaceId = typeof workspace?.id === "string" ? workspace.id : null;
  const { upload, isUploading } = useUploadFile(workspaceId, "avatar", { silent: true });
  const { mutateAsync: updateWorkspace, isPending: isUpdatingLogo } = useUpdateWorkspace();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogoChange = async (file: File | null) => {
    if (!workspaceId) return;

    if (!file) {
      setIsDeleting(true);
      try {
        // Best-effort: delete the physical file from the storage bucket
        const currentUrl = typeof workspace?.logoUrl === "string" ? workspace.logoUrl : null;
        if (currentUrl && workspaceId) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const files = await api.storage.listFiles(workspaceId) as any;
            const list = Array.isArray(files) ? files : (files?.data ?? []);
            const basePath = (u: string) => u.split("?")[0];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const match = list.find((f: any) => basePath(f.url) === basePath(currentUrl));
            if (match) {
              await api.storage.deleteFile(match.id);
              queryClient.invalidateQueries({ queryKey: ["storage", "files", workspaceId] });
            }
          } catch {
            // Non-fatal
          }
        }

        await updateWorkspace({ workspaceId, data: { logoUrl: null }, silent: true });
        appToast.success({
          title: "Logo eliminado",
          description: "El logo de la compañía ha sido eliminado.",
        });
      } catch {
        appToast.error({
          title: "Error al eliminar",
          description: "No se pudo eliminar el logo. Inténtalo de nuevo.",
        });
      } finally {
        setIsDeleting(false);
      }
      return;
    }

    try {
      const result = await upload(file);
      if (!result?.fileUrl) return;
      await updateWorkspace({
        workspaceId,
        data: { logoUrl: result.fileUrl },
        silent: true,
      });
      appToast.success({
        title: "Logo actualizado",
        description: "El logo de la compañía se ha guardado correctamente.",
      });
    } catch {
      // Handled by hook
    }
  };

  const isLoading = isUpdatingInfo || isUpdatingLogo || isUploading || isDeleting;

  return (
    <HeroHeader
      title={(typeof workspace?.name === "string" ? workspace.name : null) ?? "Compañía"}
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
            <span>Desde {formatEntityDate(workspace?.createdAt as string | Date | null | undefined)}</span>
          </div>
        </>
      }
      avatar={
        <ProfileAvatar
          src={typeof workspace?.logoUrl === "string" ? workspace.logoUrl : undefined}
          fallback={typeof workspace?.name === "string" ? workspace.name : "C"}
          size="lg"
          isUploading={isUploading}
          isDeleting={isDeleting}
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
          {isEditing ? <>Cancelar Edición</> : (
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
