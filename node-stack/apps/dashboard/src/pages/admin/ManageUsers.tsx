import { ManageUsersContent } from "@/features/admin/components/ManageUsers/ManageUsersContent";
import { ManageUsersPage } from "@/features/admin/components/ManageUsers/ManageUsersPage";

const ManageUsers = () => {
  return (
    <ManageUsersPage>
      <ManageUsersContent />
    </ManageUsersPage>
  );
};

export default ManageUsers;