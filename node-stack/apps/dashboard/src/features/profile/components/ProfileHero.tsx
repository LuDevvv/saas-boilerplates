import { Calendar, Edit3 } from "lucide-react";
import { Button, Badge, HeroHeader, ProfileAvatar } from "@node-stack/ui";
import { useAuth } from "@/hooks/stores/useAuth";
import { formatDateShort } from "@node-stack/utils";
import { appToast } from "@components/alerts/Toasts";
import { FC } from "react";
import { useUploadFile } from "@/features/storage/hooks/useStorage";
import { useUpdateProfile } from "@/features/auth/hooks/useUpdateProfile";

interface ProfileHeroProps {
  isEditing: boolean;
  onToggleEdit: () => void;
}

export const ProfileHero: FC<ProfileHeroProps> = ({ isEditing, onToggleEdit }) => {
  const { user } = useAuth();
  const { upload, isUploading } = useUploadFile(null);
  const { mutateAsync: updateProfile } = useUpdateProfile();

  const handleImageChange = async (file: File | null) => {
    if (!file) return;

    try {
      const result = await upload(file);
      if (!result?.fileUrl) return;
      await updateProfile({
        avatarUrl: result.fileUrl,
      });
      appToast.success({
        title: "Avatar actualizado",
        description: "Tu foto de perfil se ha guardado correctamente."
      });
    } catch (error) {
      // Handled by hook
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
