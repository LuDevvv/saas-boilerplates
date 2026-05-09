import { Button, CalloutCard } from "@node-stack/ui";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { FC, useState } from "react";


import { TwoFactorModal } from "./TwoFactorModal";
import { useDisable2fa } from "../../auth/hooks/use2faMutations";

import { appToast } from "@/components/alerts/Toasts";
import { useAuth } from "@/hooks/stores/useAuth";

export const SecurityCard: FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutateAsync: disable2fa, isPending: isDisabling } = useDisable2fa();

  const isEnabled = user?.twoFactorEnabled || false;

  const handleDisable = async () => {
    try {
      await disable2fa();
      appToast.success({
        title: "2FA Desactivado",
        description: "Se ha eliminado la protección de dos pasos de tu cuenta."
      });
    } catch {
      appToast.error({
        title: "Error",
        description: "No se pudo desactivar el 2FA. Inténtalo de nuevo."
      });
    }
  };

  return (
    <>
      <CalloutCard
        icon={isEnabled ? ShieldCheck : ShieldAlert}
        iconTone={isEnabled ? "success" : "primary"}
        variant="card"
        title="Seguridad en Dos Pasos"
        description={
          isEnabled
            ? "Tu cuenta está protegida. Cada vez que inicies sesión, deberás introducir un código único de tu aplicación."
            : "Añade una capa extra de protección. Evita el acceso no autorizado incluso si alguien consigue tu contraseña."
        }
        status={{
          label: isEnabled ? "Activado y seguro" : "Configuración pendiente",
          tone: isEnabled ? "success" : "warning",
          pulse: true,
        }}
        action={
          isEnabled ? (
            <Button
              variant="outline"
              onClick={handleDisable}
              disabled={isDisabling}
              className="h-11 w-full rounded-xl border-red-200 dark:border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold uppercase text-[10px] transition-all active:scale-95"
            >
              {isDisabling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Desactivar 2FA"}
            </Button>
          ) : (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="h-11 w-full rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground font-bold uppercase text-[10px] transition-all active:scale-95"
            >
              Configurar Seguridad 2FA
            </Button>
          )
        }
      />

      <TwoFactorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
