import type { Meta, StoryObj } from "@storybook/react";
import { Users, DollarSign, TrendingUp, Activity } from "lucide-react";

import { KPICard } from "../components/ui/KPICard.js";

const meta: Meta<typeof KPICard> = {
  title: "UI/KPICard",
  component: KPICard,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "secondary", "accent"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof KPICard>;

export const Default: Story = {
  args: {
    label: "Total Users",
    value: "12,453",
    icon: Users,
    trend: "+12%",
    variant: "default",
  },
};

export const Primary: Story = {
  args: {
    label: "Monthly Revenue",
    value: "$48,295",
    icon: DollarSign,
    trend: "+8.3%",
    variant: "primary",
  },
};

export const Grid: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px", padding: "16px" }}>
      <KPICard label="Users" value="12,453" icon={Users} trend="+12%" variant="default" />
      <KPICard label="Revenue" value="$48,295" icon={DollarSign} trend="+8%" variant="primary" />
      <KPICard label="Growth" value="34.2%" icon={TrendingUp} trend="+5%" variant="secondary" />
      <KPICard label="Uptime" value="99.98%" icon={Activity} trend="+0.1%" variant="accent" />
    </div>
  ),
};
