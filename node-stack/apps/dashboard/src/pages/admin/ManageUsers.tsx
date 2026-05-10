import { Suspense } from "react";

import { AdminPageShell } from "@/features/admin/components/AdminPageShell";
import { ManageUsersSkeleton } from "@/features/admin/components/AdminSkeletons";
import { ManageUsersContent } from "@/features/admin/components/ManageUsers/ManageUsersContent";

const ManageUsers = () => (
  <AdminPageShell>
    <Suspense fallback={<ManageUsersSkeleton />}>
      <ManageUsersContent />
    </Suspense>
  </AdminPageShell>
);

export default ManageUsers;
