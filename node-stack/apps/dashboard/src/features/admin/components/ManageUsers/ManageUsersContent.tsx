import { PageHeader } from "@node-stack/ui";
import { Download, UserPlus } from "lucide-react";
import { FC, useState } from "react";
import { Link } from "react-router-dom";

import { UserTableContent } from "./UserTableContent";

import { useAdminUsers, useUpdateUserStatus, useUpdateUserRole, useImpersonateUser } from "@/features/admin";
import { appToast } from "@/components/alerts/Toasts";

export const ManageUsersContent: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: users } = useAdminUsers();
  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();
  const impersonate = useImpersonateUser();

  const handleSuspend = (userId: string) => {
    if (confirm("¿Suspender este usuario? Se cerrarán todas sus sesiones activas.")) {
      updateStatus.mutate({ userId, status: "suspended" });
    }
  };

  const handleBan = (userId: string) => {
    if (confirm("¿Banear permanentemente este usuario? Se cerrarán todas sus sesiones activas.")) {
      updateStatus.mutate({ userId, status: "banned" });
    }
  };

  const handlePromoteAdmin = (userId: string) => {
    if (confirm("¿Promover a Admin? Se invalidarán todas sus sesiones activas.")) {
      updateRole.mutate({ userId, role: "admin" });
    }
  };

  const handleImpersonate = (userId: string) => {
    if (confirm("¿Iniciar sesión como este usuario? Podrás actuar en su nombre durante 24h.")) {
      impersonate.mutate(userId);
    }
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
