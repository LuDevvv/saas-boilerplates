import { FC } from "react";
import {
  Users,
  DollarSign,
  Activity,
  UserPlus,
  Loader2,
} from "lucide-react";
import { useAdminStats } from "@/features/admin";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { AdminStatsGrid } from "./AdminStatsGrid";
import { AdminStatCard } from "./AdminStatCard";
import { AdminActivityFeed } from "./AdminActivityFeed";
import { AdminQuickActions } from "./AdminQuickActions";

export const AdminContent: FC = () => {
  const { data, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
          <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-[32px] border border-dashed border-red-100 bg-red-50/20">
        <div className="text-center">
          <p className="text-lg font-heading text-red-600">Error de Sincronización</p>
          <p className="text-sm text-red-400 font-label mt-1">No pudimos cargar las estadísticas del sistema.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Usuarios Totales",
      value: data.totalUsers.toLocaleString(),
      change: "+12.5%",
      trend: "up" as const,
      icon: Users,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
    },
    {
      label: "Nuevos Registros",
      value: data.newRegistrations.toLocaleString(),
      change: "+18.2%",
      trend: "up" as const,
      icon: UserPlus,
      color: "text-primary-600 bg-primary-50 dark:bg-primary-500/10 dark:text-primary-400",
    },
    {
      label: "Suscripciones Activas",
      value: data.activeSubscriptions.toLocaleString(),
      change: "-2.4%",
      trend: "down" as const,
      icon: DollarSign,
      color: "text-teal-600 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400",
    },
    {
      label: "Carga del Sistema",
      value: `${data.systemLoad}%`,
      change: "Estable",
      trend: "neutral" as const,
      icon: Activity,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
    },
  ];

  return (
    <div className="flex flex-col gap-10 w-full max-w-[1600px] mx-auto pb-20 px-4 md:px-6 animate-fade-in">
      <SectionHeader
        title="Admin Overview"
        subtitle="Monitorea la salud de tu plataforma y gestiona recursos en tiempo real."
        action={<AdminQuickActions />}
      />

      <AdminStatsGrid>
        {stats.map((stat) => (
          <AdminStatCard key={stat.label} {...stat} />
        ))}
      </AdminStatsGrid>

      <AdminActivityFeed />
    </div>
  );
};