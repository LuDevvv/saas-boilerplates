import { Suspense } from "react";

import { ManageUsersContent } from "@/features/admin/components/ManageUsers/ManageUsersContent";
import { AdminPageShell } from "@/features/admin/components/AdminPageShell";
import { ManageUsersSkeleton } from "@/features/admin/components/AdminSkeletons";

const ManageUsers = () => (
  <AdminPageShell>
    <Suspense fallback={<ManageUsersSkeleton />}>
      <ManageUsersContent />
    </Suspense>
  </AdminPageShell>
);

export default ManageUsers;
