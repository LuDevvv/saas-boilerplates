import type { Meta, StoryObj } from "@storybook/react";

import { StatusPill } from "../components/ui/StatusPill.js";

const meta: Meta<typeof StatusPill> = {
  title: "UI/StatusPill",
  component: StatusPill,
  tags: ["autodocs"],
  argTypes: {
    tone: { control: "select", options: ["success", "warning", "info", "neutral", "danger"] },
    pulse: { control: "boolean" },
    hideDot: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof StatusPill>;

export const Default: Story = { args: { label: "Active", tone: "success" } };

export const Warning: Story = { args: { label: "Pending", tone: "warning" } };

export const Danger: Story = { args: { label: "Failed", tone: "danger" } };

export const Info: Story = { args: { label: "In Review", tone: "info" } };

export const Neutral: Story = { args: { label: "Inactive", tone: "neutral" } };

export const WithPulse: Story = { args: { label: "Live", tone: "success", pulse: true } };

export const AllTones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      <StatusPill label="Active" tone="success" />
      <StatusPill label="Pending" tone="warning" />
      <StatusPill label="Failed" tone="danger" />
      <StatusPill label="In Review" tone="info" />
      <StatusPill label="Inactive" tone="neutral" />
      <StatusPill label="Live" tone="success" pulse />
    </div>
  ),
};
