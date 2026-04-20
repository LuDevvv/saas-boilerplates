import { User as UserComponent } from "@/components/sections/profile/User";
import { User } from "lucide-react";
import { HeroBanner } from "@/components/ui/HeroBanner";

const PersonalProfile = () => {
  return (
    <div className="flex flex-col gap-6 min-h-full animate-fade-in-up w-full pt-6">
      <HeroBanner
        icon={<User />}
        label="Perfil Personal"
        title="Tu información de contacto y"
        titleHighlight="datos de tu cuenta"
        description="Administra tu nombre, correo electrónico, teléfono y foto de perfil."
        colorScheme="indigo"
      />

      <UserComponent />
    </div>
  );
};

export default PersonalProfile;
