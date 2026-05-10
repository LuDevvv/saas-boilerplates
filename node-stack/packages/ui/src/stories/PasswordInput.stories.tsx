import type { Meta, StoryObj } from "@storybook/react";

import { PasswordInput } from "../components/ui/PasswordInput.js";

const meta: Meta<typeof PasswordInput> = {
  title: "UI/PasswordInput",
  component: PasswordInput,
  tags: ["autodocs"],
  argTypes: {
    showStrength: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {
  args: { label: "Password", placeholder: "Enter your password" },
};

export const WithStrengthMeter: Story = {
  args: {
    label: "New Password",
    placeholder: "Choose a strong password",
    showStrength: true,
    defaultValue: "MyP@ssw0rd!",
  },
};

export const WithError: Story = {
  args: {
    label: "Password",
    placeholder: "Enter your password",
    error: "Password must be at least 8 characters.",
  },
};

export const Disabled: Story = {
  args: {
    label: "Password",
    value: "••••••••",
    disabled: true,
  },
};
