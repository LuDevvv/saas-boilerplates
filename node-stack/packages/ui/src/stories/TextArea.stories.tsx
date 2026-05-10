import type { Meta, StoryObj } from "@storybook/react";

import { TextArea } from "../components/ui/TextArea.js";

const meta: Meta<typeof TextArea> = {
  title: "UI/TextArea",
  component: TextArea,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    fullWidth: { control: "boolean" },
    rows: { control: { type: "number", min: 2, max: 20 } },
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: { label: "Description", placeholder: "Enter a description..." },
};

export const WithHelperText: Story = {
  args: {
    label: "Bio",
    placeholder: "Tell us about yourself",
    helperText: "Max 500 characters.",
    rows: 5,
  },
};

export const WithError: Story = {
  args: {
    label: "Message",
    placeholder: "Your message here",
    error: "Message is required.",
    value: "",
  },
};

export const Disabled: Story = {
  args: {
    label: "Notes",
    value: "These notes are read-only.",
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: "Comment",
    placeholder: "Write your comment...",
    fullWidth: true,
    rows: 4,
  },
};
