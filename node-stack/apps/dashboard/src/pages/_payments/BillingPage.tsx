import { FC } from "react";

import { PageShell } from "@/features/admin/components/AdminPageShell";
import Billing from "@/pages/payments/Billing";

const BillingPage: FC = () => (
  <PageShell>
    <Billing />
  </PageShell>
);

export default BillingPage;
