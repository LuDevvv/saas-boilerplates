import type { Meta, StoryObj } from "@storybook/react";

import { RadioButton } from "../components/ui/RadioButton.js";

const meta: Meta<typeof RadioButton> = {
  title: "UI/RadioButton",
  component: RadioButton,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    checked: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof RadioButton>;

export const Default: Story = {
  args: { label: "Option A", name: "demo" },
};

export const Checked: Story = {
  args: { label: "Option B", name: "demo", defaultChecked: true },
};

export const WithHelperText: Story = {
  args: {
    label: "Monthly billing",
    helperText: "Pay month-to-month, cancel anytime.",
    name: "billing",
  },
};

export const WithError: Story = {
  args: {
    label: "Annual billing",
    error: "Please select a billing option.",
    name: "billing",
  },
};

export const Disabled: Story = {
  args: { label: "Not available", name: "demo", disabled: true },
};

export const Group: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <RadioButton label="Free – $0/mo" name="plan" helperText="Up to 3 projects." />
      <RadioButton label="Pro – $12/mo" name="plan" helperText="Unlimited projects." defaultChecked />
      <RadioButton label="Enterprise – custom" name="plan" helperText="Contact sales." />
    </div>
  ),
};
