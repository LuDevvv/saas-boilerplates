import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { BillingToggle } from "../components/ui/BillingToggle.js";

const meta: Meta<typeof BillingToggle> = {
  title: "UI/BillingToggle",
  component: BillingToggle,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BillingToggle>;

export const Default: Story = {
  render: () => {
    const [isAnnual, setIsAnnual] = useState(false);
    return (
      <BillingToggle
        isAnnualBilling={isAnnual}
        onChange={setIsAnnual}
      />
    );
  },
};

export const AnnualSelected: Story = {
  render: () => {
    const [isAnnual, setIsAnnual] = useState(true);
    return (
      <BillingToggle
        isAnnualBilling={isAnnual}
        onChange={setIsAnnual}
        discountLabel="Save 40%"
      />
    );
  },
};

export const CustomLabels: Story = {
  render: () => {
    const [isAnnual, setIsAnnual] = useState(false);
    return (
      <BillingToggle
        isAnnualBilling={isAnnual}
        onChange={setIsAnnual}
        monthlyLabel="Pay Monthly"
        annualLabel="Pay Annually"
        discountLabel="2 months free"
      />
    );
  },
};
