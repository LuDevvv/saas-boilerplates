import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user/userService";
import { useAuthStore } from "@/stores/authStore";
import { appToast } from "@/components/alerts/Toasts";

export const useUserData = () => {
  const queryClient = useQueryClient();
  const { updateAuthState, user: storeUser } = useAuthStore();

  const userQuery = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const user = await userService.getProfile();
      // Sync with store if needed, though checkAuthStatus usually does this
      return user;
    },
    initialData: storeUser || undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => userService.updateProfile(data),
    onSuccess: (user) => {
      appToast.success({
        title: "¡Perfil actualizado!",
        description: "Tus cambios se han guardado correctamente."
      });
      updateAuthState(user);
      queryClient.setQueryData(["user-profile"], user);
    },
    onError: () => appToast.error({
      title: "Error de actualización",
      description: "No pudimos guardar los cambios. Inténtalo de nuevo."
    }),
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => userService.uploadProfilePicture(file),
    onSuccess: (user) => {
      appToast.success({
        title: "¡Imagen actualizada!",
        description: "Tu nueva foto de perfil ya está lista."
      });
      updateAuthState(user);
      queryClient.setQueryData(["user-profile"], user);
    },
    onError: () => appToast.error({
      title: "Error de subida",
      description: "No se pudo actualizar la imagen de perfil."
    }),
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: () => userService.deleteProfilePicture(),
    onSuccess: () => {
      appToast.success({
        title: "Imagen eliminada",
        description: "Tu foto de perfil se ha quitado correctamente."
      });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      // The invalidation will trigger a getProfile call which re-syncs authStore via userQuery onSuccess if we add one,
      // or we can manually check status here.
    },
    onError: () => appToast.error({
      title: "Error al eliminar",
      description: "No pudimos quitar la imagen en este momento."
    }),
  });

  return {
    user: userQuery.data || storeUser,
    isLoading: userQuery.isLoading,
    isUpdating: updateMutation.isPending || uploadAvatarMutation.isPending || deleteAvatarMutation.isPending,
    
    // Actions
    updateProfile: updateMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    deleteAvatar: deleteAvatarMutation.mutateAsync,
  };
};
