import type { Meta, StoryObj } from "@storybook/react";

import { PlanBadge } from "../components/ui/PlanBadge.js";

const meta: Meta<typeof PlanBadge> = {
  title: "UI/PlanBadge",
  component: PlanBadge,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["xs", "sm", "md", "lg"] },
    isPremium: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof PlanBadge>;

export const Free: Story = {
  args: { planName: "Free", isPremium: false },
};

export const Pro: Story = {
  args: { planName: "Pro", isPremium: true },
};

export const Enterprise: Story = {
  args: { planName: "Enterprise", isPremium: true, size: "md" },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
      <PlanBadge planName="Pro" isPremium size="xs" />
      <PlanBadge planName="Pro" isPremium size="sm" />
      <PlanBadge planName="Pro" isPremium size="md" />
      <PlanBadge planName="Pro" isPremium size="lg" />
    </div>
  ),
};
