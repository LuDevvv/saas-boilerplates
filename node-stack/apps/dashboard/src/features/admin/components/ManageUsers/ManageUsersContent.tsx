import { FC, useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@node-stack/ui";
import { useAdminUsers, useUpdateUserStatus, useUpdateUserRole } from "@/features/admin";
import { UserTableContent } from "./UserTableContent";

export const ManageUsersContent: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: users } = useAdminUsers();
  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();

  const handleSuspend = (userId: string) => {
    if (confirm("Are you sure you want to suspend this user?")) {
      updateStatus.mutate({ userId, status: "suspended" });
    }
  };

  const handleBan = (userId: string) => {
    if (confirm("Are you sure you want to ban this user?")) {
      updateStatus.mutate({ userId, status: "banned" });
    }
  };

  const handlePromoteAdmin = (userId: string) => {
    if (confirm("Promote this user to Admin?")) {
      updateRole.mutate({ userId, role: "admin" });
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
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </>
  );
};
