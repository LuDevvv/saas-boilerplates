import type { Meta, StoryObj } from "@storybook/react";

import { PricingTable } from "../components/PricingTable.js";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for individuals getting started.",
    features: ["3 projects", "5 GB storage", "Community support", "Basic analytics"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12/mo",
    description: "For growing teams that need more power.",
    features: ["Unlimited projects", "50 GB storage", "Priority support", "Advanced analytics", "Team collaboration"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with custom needs.",
    features: ["Everything in Pro", "Unlimited storage", "Dedicated support", "Custom integrations", "SLA guarantee"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const meta: Meta<typeof PricingTable> = {
  title: "Pages/PricingTable",
  component: PricingTable,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PricingTable>;

export const Default: Story = {
  args: { tiers: TIERS },
};

export const TwoTiers: Story = {
  args: {
    tiers: [
      {
        name: "Basic",
        price: "$9/mo",
        description: "Everything you need to get started.",
        features: ["10 projects", "10 GB storage", "Email support"],
        cta: "Subscribe",
        highlighted: false,
      },
      {
        name: "Business",
        price: "$49/mo",
        description: "Scale your team with powerful features.",
        features: ["Unlimited projects", "100 GB storage", "Phone support", "Advanced analytics"],
        cta: "Subscribe",
        highlighted: true,
      },
    ],
  },
};
