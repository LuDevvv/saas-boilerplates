import { FC, lazy, Suspense } from "react";
import { LoadingState } from "@/components/shared/LoadingState";

const MembersPage = lazy(() => import("@features/workspaces/pages/MembersPage"));

const WorkspaceMembersPage: FC = () => {
  return (
    <Suspense fallback={<LoadingState message="Cargando equipo..." />}>
      <MembersPage />
    </Suspense>
  );
};

export default WorkspaceMembersPage;
