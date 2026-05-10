import { FC } from "react";

import { PageShell } from "@/features/admin/components/AdminPageShell";
import Pricing from "@/pages/payments/Pricing";

const PricingPage: FC = () => (
  <PageShell>
    <Pricing />
  </PageShell>
);

export default PricingPage;
