import { FC } from "react";
import MembersPage from "@features/workspaces/pages/MembersPage";

// Inner Suspense removed — lazy loading + MembersLayoutSkeleton handled by routes.tsx.
const WorkspaceMembersPage: FC = () => <MembersPage />;

export default WorkspaceMembersPage;
