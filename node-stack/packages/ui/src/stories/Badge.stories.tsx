import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "../components/ui/Badge.js";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "success", "warning", "info", "premium"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { children: "Default" } };
export const Success: Story = { args: { variant: "success", children: "Active" } };
export const Warning: Story = { args: { variant: "warning", children: "Pending" } };
export const Destructive: Story = { args: { variant: "destructive", children: "Failed" } };
export const Premium: Story = { args: { variant: "premium", children: "Pro" } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      {(["default","secondary","destructive","outline","success","warning","info","premium"] as const).map(
        (v) => <Badge key={v} variant={v}>{v}</Badge>
      )}
    </div>
  ),
};
