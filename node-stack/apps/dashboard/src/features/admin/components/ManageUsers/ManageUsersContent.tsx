import { PageHeader } from "@node-stack/ui";
import { Download } from "lucide-react";
import { FC, useState } from "react";

import { UserTableContent } from "./UserTableContent";

import { useAdminUsers, useUpdateUserStatus, useUpdateUserRole , useImpersonateUser } from "@/features/admin";


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

  return (
    <>
      <PageHeader
        eyebrow="ADMIN"
        title="Manage Users"
        description="View, filter, and manage permissions for all platform users."
        action={
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-[13px] font-medium text-fg-secondary hover:bg-surface-hover hover:text-fg hover:border-border-strong transition-colors">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-600 px-5 py-2.5 text-[13px] font-medium text-primary-foreground transition-all shadow-[0_4px_14px_-2px_rgba(0,64,128,0.20)] dark:shadow-[0_4px_14px_-2px_rgba(91,168,229,0.20)] active:scale-95">
              Add New User
            </button>
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
