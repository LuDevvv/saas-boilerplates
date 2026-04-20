import { Suspense } from "react";
import { AdminOverview } from "@/features/admin/components/admin-overview";
import { PageHeader } from "@/components/page-header";
import { Shell } from "@/components/shell";

export const metadata = {
  title: "Admin Overview",
  description: "Monitor system status and overall performance.",
};

export default function AdminPage() {
  return (
    <Shell>
      <PageHeader
        title="Admin Overview"
        description="Monitor system status and overall performance."
      />
      <Suspense fallback={<div>Loading...</div>}>
        <AdminOverview />
      </Suspense>
    </Shell>
  );
}
