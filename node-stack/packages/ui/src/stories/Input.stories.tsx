import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "../components/ui/Input.js";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: "Enter text…" },
};

export const WithLabel: Story = {
  args: { label: "Email address", placeholder: "you@example.com", type: "email" },
};

export const WithError: Story = {
  args: { label: "Email", placeholder: "you@example.com", error: "Invalid email address" },
};

export const Disabled: Story = {
  args: { label: "Disabled field", value: "Cannot edit", disabled: true },
};
