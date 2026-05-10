import type { Meta, StoryObj } from "@storybook/react";

import { PhoneInput } from "../components/ui/PhoneInput.js";

const meta: Meta<typeof PhoneInput> = {
  title: "UI/PhoneInput",
  component: PhoneInput,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    fullWidth: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof PhoneInput>;

export const Default: Story = {
  args: {
    label: "Phone Number",
    value: "",
    onChange: () => {},
  },
};

export const WithValue: Story = {
  args: {
    label: "Mobile",
    value: "+1 555 123 4567",
    onChange: () => {},
  },
};

export const WithError: Story = {
  args: {
    label: "Phone Number",
    value: "",
    error: "A valid phone number is required.",
    onChange: () => {},
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Contact Number",
    value: "",
    helperText: "Include country code, e.g. +1 for US.",
    onChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    label: "Phone Number",
    value: "+44 7700 900 123",
    disabled: true,
    onChange: () => {},
  },
};
