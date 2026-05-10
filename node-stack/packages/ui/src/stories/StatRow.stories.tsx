import type { Meta, StoryObj } from "@storybook/react";
import { DollarSign, TrendingDown, TrendingUp, Users } from "lucide-react";

import { StatRow } from "../components/ui/StatRow.js";

const meta: Meta<typeof StatRow> = {
  title: "UI/StatRow",
  component: StatRow,
  tags: ["autodocs"],
  argTypes: {
    compact: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof StatRow>;

export const Default: Story = {
  args: {
    icon: Users,
    label: "Total Users",
    value: "24,891",
  },
};

export const WithUpTrend: Story = {
  args: {
    icon: TrendingUp,
    label: "Monthly Revenue",
    value: "$48,230",
    trend: { value: 12.5, direction: "up", suffix: "%", label: "vs last month" },
  },
};

export const WithDownTrend: Story = {
  args: {
    icon: TrendingDown,
    label: "Churn Rate",
    value: "2.4%",
    trend: { value: 0.3, direction: "down", suffix: "%", label: "this month" },
  },
};

export const Compact: Story = {
  args: {
    icon: DollarSign,
    label: "ARR",
    value: "$578,000",
    compact: true,
  },
};

export const Dashboard: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0", width: "300px", border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
      <StatRow icon={Users} label="Active Users" value="1,429" trend={{ value: 8, direction: "up", suffix: "%" }} />
      <StatRow icon={DollarSign} label="MRR" value="$12,440" trend={{ value: 3.2, direction: "up", suffix: "%" }} />
      <StatRow icon={TrendingDown} label="Churn" value="1.8%" trend={{ value: 0.4, direction: "down", suffix: "%" }} />
    </div>
  ),
};
