import { FC } from "react";
import { User as UserIcon, Mail, Phone, MapPin, Smartphone } from "lucide-react";
import { Card } from "@node-stack/ui";
import { useAuth } from "@/hooks/stores/useAuth";
import { useUpdateProfile } from "@/features/auth/hooks/useUpdateProfile";
import { appToast } from "@/components/alerts/Toasts";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { InfoItem } from "./InfoItem";
import { SecurityCard } from "./SecurityCard";
import { PersonalEditForm } from "./PersonalEditForm";
import { LoginHistory } from "./LoginHistory";
import { ProfileFormValues } from "../types";

export const ProfileContent: FC = () => {
  const { user } = useAuth();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const handleSave = async (data: ProfileFormValues) => {
    try {
      await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
      appToast.success({
        title: "Perfil actualizado",
        description: "Tus cambios se han sincronizado correctamente."
      });
    } catch (error) {
      appToast.error({
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo."
      });
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-full overflow-hidden">
      <SectionHeader 
        badge="Mi Perfil"
        tag="Información Personal"
        title={`${user?.firstName || ''} ${user?.lastName || ''}`}
        subtitle="Gestiona tu información de contacto, biografía y preferencias de cuenta desde aquí."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Sidebar Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="card-premium p-5 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-50 dark:border-white/5">
              <h2 className="text-lg font-heading text-gray-950 dark:text-white">Resumen</h2>
              <UserIcon className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-1">
              <InfoItem icon={Smartphone} label="Usuario" value="@graziele" />
              <InfoItem icon={Mail} label="Email" value={user?.email || ""} badge="Verificado" />
              <InfoItem icon={Phone} label="Teléfono" value="(11) 9141-8888" badge="Verificado" />
              <InfoItem icon={MapPin} label="Ubicación" value="São Paulo, BR" />
            </div>
          </Card>

          <SecurityCard />
        </div>

        {/* Form and History */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <PersonalEditForm user={user} onSave={handleSave} isPending={isPending} />
          <LoginHistory />
        </div>
      </div>
    </div>
  );
};