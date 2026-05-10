import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "../components/ui/Input.js";
import { Label } from "../components/ui/Label.js";

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
  argTypes: {
    required: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: { children: "Email address" },
};

export const Required: Story = {
  args: { children: "Password", required: true },
};

export const WithInput: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "300px" }}>
      <Label htmlFor="username" required>Username</Label>
      <Input id="username" placeholder="Enter your username" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "300px" }}>
      <Label htmlFor="readonly">Read-only Field</Label>
      <Input id="readonly" value="Cannot be changed" disabled />
    </div>
  ),
};
