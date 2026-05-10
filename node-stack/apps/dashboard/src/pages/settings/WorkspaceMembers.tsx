import MembersPage from "@features/workspaces/pages/MembersPage";
import { FC } from "react";

import { PageShell } from "@/features/admin/components/AdminPageShell";

const WorkspaceMembersPage: FC = () => (
  <PageShell>
    <MembersPage />
  </PageShell>
);

export default WorkspaceMembersPage;
