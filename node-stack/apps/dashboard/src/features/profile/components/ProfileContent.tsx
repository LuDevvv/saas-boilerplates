import { FC, useState } from "react";
import { cn } from "@/utils/classNames";
import { useAuth } from "@/hooks/stores/useAuth";
import { useUpdateProfile } from "@/features/auth/hooks/useUpdateProfile";
import { appToast } from "@/components/alerts/Toasts";
import { SecurityCard } from "./SecurityCard";
import { PersonalEditForm } from "./PersonalEditForm";
import { LoginHistory } from "./LoginHistory";
import { ProfileHero } from "./ProfileHero";
import { ProfileFormValues } from "../types";
import { useSessions } from "../hooks/useSessions";

export const ProfileContent: FC = () => {
  const { user } = useAuth();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const { sessions, revokeAllSessions, isRevokingAll } = useSessions();
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (data: ProfileFormValues) => {
    try {
      await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName || undefined,
        phone: data.phone,
      });

      appToast.success({
        title: "Perfil actualizado",
        description: "Tus cambios se han sincronizado correctamente."
      });
      setIsEditing(false);
    } catch (error) {
      appToast.error({
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo."
      });
    }
  };

  return (
    <div className="space-y-6 pb-20 w-full">
      {/* Profile Header - Hero Section */}
      <ProfileHero
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing(!isEditing)}
      />

      {/* Main Layout - Bento Grid 12 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column - Primary Actions (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <PersonalEditForm
            isEditing={isEditing}
            user={user ? {
              firstName: user.firstName ?? undefined,
              lastName: user.lastName ?? undefined,
              phone: user.phone ?? undefined,
              email: user.email ?? undefined,
            } : null}
            onSave={handleSave}
            isPending={isPending}
            onCancel={() => setIsEditing(false)}
          />

          <LoginHistory
            onRevokeAll={() => revokeAllSessions()}
            isRevokingAll={isRevokingAll}
            canRevokeAll={sessions.length > 1}
          />
        </div>

        {/* Right Column - Secondary Actions & Status (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
          <SecurityCard />

          {/* Account Status Widget */}
          <div className="rounded-[20px] bg-surface p-6 border border-border shadow-[var(--shadow-card)]">
            <h3 className="text-[14px] font-bold text-fg mb-4 uppercase">Estado de la Cuenta</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-muted border border-border-subtle">
                <span className="text-[11px] font-bold text-fg-muted uppercase">Verificación</span>
                <span className={cn(
                  "text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg",
                  user?.emailVerified
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                    : "text-amber-600 dark:text-amber-400 bg-amber-500/10"
                )}>
                  {user?.emailVerified ? 'Completada' : 'Pendiente'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-muted border border-border-subtle">
                <span className="text-[11px] font-bold text-fg-muted uppercase">Tipo de Plan</span>
                <span className="text-[10px] font-bold text-primary uppercase px-2.5 py-1 bg-primary/10 rounded-lg">Enterprise</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};