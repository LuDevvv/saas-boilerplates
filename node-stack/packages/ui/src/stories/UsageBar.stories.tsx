import type { Meta, StoryObj } from "@storybook/react";

import { UsageBar } from "../components/ui/UsageBar.js";

const meta: Meta<typeof UsageBar> = {
  title: "UI/UsageBar",
  component: UsageBar,
  tags: ["autodocs"],
  argTypes: {
    current: { control: { type: "number", min: 0, max: 10000 } },
    limit: { control: { type: "number", min: 1, max: 10000 } },
  },
};

export default meta;
type Story = StoryObj<typeof UsageBar>;

export const Default: Story = { args: { current: 3200, limit: 10000 } };

export const Low: Story = { args: { current: 500, limit: 10000 } };

export const High: Story = { args: { current: 8500, limit: 10000 } };

export const Critical: Story = { args: { current: 9800, limit: 10000 } };

export const Full: Story = { args: { current: 10000, limit: 10000 } };

export const AllLevels: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "400px" }}>
      <UsageBar current={1000} limit={10000} />
      <UsageBar current={4000} limit={10000} />
      <UsageBar current={7500} limit={10000} />
      <UsageBar current={9500} limit={10000} />
    </div>
  ),
};
