import { FC, lazy, Suspense } from "react";

import { StorageSkeleton } from "@/features/storage/components/StorageSkeleton";
import { PageShell } from "@/features/admin/components/AdminPageShell";

const StorageFeature = lazy(() => import("@features/storage/pages/StoragePage"));

const StoragePage: FC = () => (
  <PageShell>
    <Suspense fallback={<StorageSkeleton />}>
      <StorageFeature />
    </Suspense>
  </PageShell>
);

export default StoragePage;
