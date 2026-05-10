import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "../components/ui/Checkbox.js";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    checked: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: { label: "Accept terms and conditions" },
};

export const WithHelperText: Story = {
  args: {
    label: "Subscribe to newsletter",
    helperText: "You can unsubscribe at any time.",
  },
};

export const WithError: Story = {
  args: {
    label: "Agree to privacy policy",
    error: "You must agree before continuing.",
  },
};

export const Checked: Story = {
  args: { label: "Remember me", defaultChecked: true },
};

export const Disabled: Story = {
  args: { label: "Disabled option", disabled: true },
};
