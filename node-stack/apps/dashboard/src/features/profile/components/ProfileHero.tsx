import { appToast } from "@components/alerts/Toasts";
import { Button, Badge, HeroHeader, ProfileAvatar } from "@node-stack/ui";
import { formatDateShort } from "@node-stack/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, Edit3 } from "lucide-react";
import { FC, useState } from "react";


import { useUpdateProfile } from "@/features/auth/hooks/useUpdateProfile";
import { useUploadFile } from "@/features/storage/hooks/useStorage";
import { useAuth } from "@/hooks/stores/useAuth";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { useWorkspaceStore } from "@/stores/workspaceStore";

interface ProfileHeroProps {
  isEditing: boolean;
  onToggleEdit: () => void;
}

export const ProfileHero: FC<ProfileHeroProps> = ({ isEditing, onToggleEdit }) => {
  const { user } = useAuth();
  const { activeWorkspaceId } = useWorkspaceStore();
  const { upload, isUploading } = useUploadFile(activeWorkspaceId, "avatar", { silent: true });
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleImageChange = async (file: File | null) => {
    if (!file) {
      setIsDeleting(true);
      try {
        // Best-effort: also delete the physical file from storage so the bucket
        // doesn't accumulate orphaned avatars.
        // Presigned URLs have different query params on each generation, so we
        // match by stripping query params and comparing base paths.
        const currentUrl = user?.avatarUrl;
        if (currentUrl && activeWorkspaceId) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const files = await api.storage.listFiles(activeWorkspaceId) as any;
            const list = Array.isArray(files) ? files : (files?.data ?? []);
            const basePath = (u: string) => u.split("?")[0];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const match = list.find((f: any) => basePath(f.url) === basePath(currentUrl));
            if (match) {
              await api.storage.deleteFile(match.id);
              queryClient.invalidateQueries({ queryKey: ["storage", "files", activeWorkspaceId] });
            }
          } catch {
            // Non-fatal — the profile reference is cleared regardless
          }
        }

        await updateProfile({ avatarUrl: null });
        await queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
        appToast.success({
          title: "Avatar eliminado",
          description: "Tu foto de perfil ha sido eliminada.",
        });
      } catch {
        appToast.error({
          title: "Error al eliminar",
          description: "No se pudo eliminar el avatar. Inténtalo de nuevo.",
        });
      } finally {
        setIsDeleting(false);
      }
      return;
    }

    try {
      const result = await upload(file);
      if (!result?.fileUrl) return;
      await updateProfile({ avatarUrl: result.fileUrl });
      // Refresh user profile so the new avatar URL propagates immediately
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      appToast.success({
        title: "Avatar actualizado",
        description: "Tu foto de perfil se ha guardado correctamente.",
      });
    } catch {
      // Toast shown by hook; invalidate to clear stale preview
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    }
  };

  return (
    <HeroHeader
      title={user?.firstName || "Usuario"}
      actionsOutside={true}
      subtitle={
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Miembro desde {formatDateShort(user?.createdAt)}</span>
        </div>
      }
      avatar={
        <ProfileAvatar
          src={user?.avatarUrl}
          fallback={user?.firstName || "U"}
          size="lg"
          isUploading={isUploading}
          isDeleting={isDeleting}
          onImageChange={handleImageChange}
          onError={(err) => appToast.error(err)}
        />
      }
      badge={
        <Badge className="bg-white/15 text-white border border-white/25 dark:bg-primary/15 dark:text-primary dark:border-primary/25 text-[10px] font-bold uppercase py-1 px-3 rounded-full backdrop-blur-sm shrink-0">
          Verificado
        </Badge>
      }
      actions={
        <Button
          variant={isEditing ? "secondary" : "outline"}
          onClick={onToggleEdit}
          className="rounded-xl h-11 w-full sm:w-auto px-8 flex items-center justify-center gap-2 font-bold uppercase text-[11px] shadow-none active:scale-95 transition-colors
            text-white dark:text-[color:var(--text-primary)]
            bg-primary sm:bg-white/10 dark:bg-primary/15 dark:sm:bg-primary/15
            border-white/20 dark:border-primary/25
            hover:bg-primary-600 sm:hover:bg-white/20 dark:hover:bg-primary/25"
        >
          {isEditing ? (
            <>
              <span className="hidden sm:inline">Cancelar Edición</span>
              <span className="sm:hidden">Cancelar</span>
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Editar Perfil</span>
              <span className="sm:hidden">Editar</span>
            </>
          )}
        </Button>
      }
    />
  );
};
