import { FC } from "react";

import { PageShell } from "@/features/admin/components/AdminPageShell";
import MembersPage from "@features/workspaces/pages/MembersPage";

const WorkspaceMembersPage: FC = () => (
  <PageShell>
    <MembersPage />
  </PageShell>
);

export default WorkspaceMembersPage;
