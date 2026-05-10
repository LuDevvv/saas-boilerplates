import type { Meta, StoryObj } from "@storybook/react";

import { Spinner } from "../components/ui/Spinner.js";

const meta: Meta<typeof Spinner> = {
  title: "UI/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
    color: { control: "select", options: ["primary", "white", "muted", "secondary"] },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = { args: { size: "md", color: "primary" } };

export const Small: Story = { args: { size: "sm", color: "primary" } };

export const Large: Story = { args: { size: "lg", color: "primary" } };

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  ),
};

export const AllColors: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", alignItems: "center", padding: "16px", background: "#374151", borderRadius: "8px" }}>
      <Spinner size="md" color="primary" />
      <Spinner size="md" color="white" />
      <Spinner size="md" color="muted" />
      <Spinner size="md" color="secondary" />
    </div>
  ),
};
