import { PageHeader } from "@node-stack/ui";
import { Download, UserPlus } from "lucide-react";
import { FC, useState } from "react";
import { Link } from "react-router-dom";

import { UserTableContent } from "./UserTableContent";

import { appToast } from "@/components/alerts/Toasts";
import { useAdminUsers, useUpdateUserStatus, useUpdateUserRole, useImpersonateUser } from "@/features/admin";
import { ManageUsersSkeleton } from "@/features/admin/components/AdminSkeletons";

export const ManageUsersContent: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: users, isLoading } = useAdminUsers();
  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();
  const impersonate = useImpersonateUser();

  if (isLoading) return <ManageUsersSkeleton />;

  const handleSuspend = (userId: string) => {
    appToast.warning({
      title: "¿Suspender este usuario?",
      description: "Se cerrarán todas sus sesiones activas inmediatamente.",
      actions: [
        { label: "Cancelar", variant: "ghost", onClick: () => {} },
        {
          label: "Suspender",
          variant: "danger",
          onClick: () => updateStatus.mutate({ userId, status: "suspended" }),
        },
      ],
    }, { duration: 10000 });
  };

  const handleBan = (userId: string) => {
    appToast.warning({
      title: "¿Banear permanentemente?",
      description: "El usuario perderá el acceso y sus sesiones se cerrarán. Esta acción requiere confirmación manual para revertirse.",
      actions: [
        { label: "Cancelar", variant: "ghost", onClick: () => {} },
        {
          label: "Banear",
          variant: "danger",
          onClick: () => updateStatus.mutate({ userId, status: "banned" }),
        },
      ],
    }, { duration: 12000 });
  };

  const handlePromoteAdmin = (userId: string) => {
    appToast.info({
      title: "¿Promover a Admin?",
      description: "Se invalidarán todas sus sesiones activas. El usuario tendrá acceso al panel de administración.",
      actions: [
        { label: "Cancelar", variant: "ghost", onClick: () => {} },
        {
          label: "Promover",
          variant: "primary",
          onClick: () => updateRole.mutate({ userId, role: "admin" }),
        },
      ],
    }, { duration: 10000 });
  };

  const handleImpersonate = (userId: string) => {
    appToast.info({
      title: "¿Iniciar sesión como este usuario?",
      description: "Podrás actuar en su nombre durante 24 h. Todas sus acciones quedarán registradas como impersonación.",
      actions: [
        { label: "Cancelar", variant: "ghost", onClick: () => {} },
        {
          label: "Impersonar",
          variant: "primary",
          onClick: () => impersonate.mutate(userId),
        },
      ],
    }, { duration: 10000 });
  };

  const handleExportCsv = () => {
    appToast.info({ title: "Exportación", description: "La exportación CSV estará disponible próximamente." });
  };

  return (
    <>
      <PageHeader
        eyebrow="ADMIN"
        title="Gestión de Usuarios"
        description="Visualiza, filtra y gestiona los permisos de todos los usuarios de la plataforma."
        action={
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-[13px] font-medium text-fg-secondary hover:bg-surface-hover hover:text-fg hover:border-border-strong transition-colors"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </button>
            <Link
              to="/settings/members"
              className="inline-flex items-center gap-2 rounded-xl bg-primary hover:opacity-90 px-5 py-2.5 text-[13px] font-medium text-primary-foreground transition-all shadow-[0_4px_14px_-2px_rgba(0,64,128,0.20)] dark:shadow-[0_4px_14px_-2px_rgba(91,168,229,0.20)]"
            >
              <UserPlus className="h-4 w-4" />
              Invitar usuario
            </Link>
          </div>
        }
        className="mb-6"
      />

      <UserTableContent
        users={users || []}
        onSuspend={handleSuspend}
        onBan={handleBan}
        onPromote={handlePromoteAdmin}
        onImpersonate={handleImpersonate}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </>
  );
};
