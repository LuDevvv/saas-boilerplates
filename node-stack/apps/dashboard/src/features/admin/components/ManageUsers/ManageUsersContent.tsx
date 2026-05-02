import { FC, useState } from "react";
import { Download } from "lucide-react";
import { useAdminUsers, useUpdateUserStatus, useUpdateUserRole } from "@/features/admin";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { UserTableContent } from "./UserTableContent";

export const ManageUsersContent: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: users } = useAdminUsers();
  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();

  const handleSuspend = (userId: string) => {
    if (confirm("Are you sure you want to suspend this user?")) {
      updateStatus.mutate({ userId, status: "Suspended" });
    }
  };

  const handleBan = (userId: string) => {
    if (confirm("Are you sure you want to ban this user?")) {
      updateStatus.mutate({ userId, status: "Banned" });
    }
  };

  const handlePromoteAdmin = (userId: string) => {
    if (confirm("Promote this user to Admin?")) {
      updateRole.mutate({ userId, role: "admin" });
    }
  };

  return (
    <>
      <SectionHeader
        title="Manage Users"
        subtitle="View, filter, and manage permissions for all platform users."
        action={
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-heading text-gray-950 hover:bg-gray-50 dark:border-white/5 dark:bg-gray-900 dark:text-white dark:hover:bg-white/10 transition-colors shadow-sm">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-heading text-white hover:bg-blue-700 transition-all shadow-md active:scale-95">
              Add New User
            </button>
          </div>
        }
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