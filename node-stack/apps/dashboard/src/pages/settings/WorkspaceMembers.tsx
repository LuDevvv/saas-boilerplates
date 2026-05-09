import MembersPage from "@features/workspaces/pages/MembersPage";
import { FC } from "react";

// Inner Suspense removed — lazy loading + MembersLayoutSkeleton handled by routes.tsx.
const WorkspaceMembersPage: FC = () => <MembersPage />;

export default WorkspaceMembersPage;
