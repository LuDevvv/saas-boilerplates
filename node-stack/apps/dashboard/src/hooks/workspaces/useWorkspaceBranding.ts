import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { workspacesApi } from "@/features/workspaces/api/workspaces.api";
import { appToast } from "@/components/alerts/Toasts";
import { queryKeys } from "@/lib/react-query/queryKeys";

export const useWorkspaceBranding = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const uploadLogo = async (_file: File) => {
    setIsUpdating(true);
    try {
      // TODO: Implement file upload and workspace logo update
      appToast.info({
        title: "Próximamente",
        description: "La carga de logos estará disponible pronto."
      });
    } catch (error: unknown) {
      appToast.error({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al subir el logo"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const removeLogo = async () => {
    setIsUpdating(true);
    try {
      await workspacesApi.updateWorkspace(workspaceId, { logoUrl: null });
      
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
      
      appToast.success({
        title: "Logo eliminado",
        description: "Se ha vuelto al sistema de iniciales por defecto."
      });
    } catch (error: unknown) {
      appToast.error({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el logo"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    uploadLogo,
    removeLogo,
    isUpdating,
  };
};