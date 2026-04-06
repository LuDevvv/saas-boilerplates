import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user/userService";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

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
      toast.success("Perfil actualizado correctamente");
      updateAuthState(user);
      queryClient.setQueryData(["user-profile"], user);
    },
    onError: () => toast.error("Error al actualizar el perfil"),
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async ({ file, onProgress }: { file: File, onProgress?: (p: number) => void }) => {
      const { storageService } = await import("@/services/StorageService");
      
      // Step 1: Presigned URL
      const { uploadUrl, fileKey } = await storageService.getPresignedUrl(
        file.name, 
        file.type, 
        "avatar"
      );

      // Step 2: PUT Directly to S3/R2
      await storageService.uploadFile(file, uploadUrl, onProgress);

      // Step 3: Verify and complete
      const response = await storageService.verifyUpload(fileKey);
      return response.data; // Backend should return the updated User
    },
    onSuccess: (user) => {
      if (user && Object.keys(user).length > 0) {
        updateAuthState(user);
        queryClient.setQueryData(["user-profile"], user);
      } else {
        // Fallback for mock or empty data: force a refetch
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      }
    },
    onError: () => toast.error("Error al subir la imagen"),
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: () => userService.deleteProfilePicture(),
    onSuccess: () => {
      toast.success("Imagen de perfil eliminada");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      // The invalidation will trigger a getProfile call which re-syncs authStore via userQuery onSuccess if we add one,
      // or we can manually check status here.
    },
    onError: () => toast.error("Error al eliminar la imagen"),
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
