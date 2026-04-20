import { FC } from "react";
import { useAuth } from "@/hooks/stores/useAuth";
import { LayoutDashboard } from "lucide-react";
import { HeroBanner } from "@/components/ui/HeroBanner";

export const MagicBento: FC = () => {
  const { user } = useAuth();

  return (
    <div className="w-full animate-fade-in-up pb-10 flex flex-col gap-6">
      <HeroBanner
        icon={<LayoutDashboard />}
        label="Panel de Control"
        title={`Hola, ${user?.name || "Usuario"} 👋`}
        titleHighlight="todo marcha sobre ruedas"
        description="Aquí tienes el resumen de tu negocio. Visualiza tus métricas clave y mantén el control de tu operación."
        colorScheme="violet"
      />
    </div>
  );
};
