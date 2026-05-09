import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components/ui/Button.js";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "danger", "success", "outline"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "icon"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: "primary", children: "Click me", size: "md" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary", size: "md" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Delete", size: "md" },
};

export const Loading: Story = {
  args: { variant: "primary", children: "Saving…", loading: true, size: "md" },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <Button variant="primary" size="xs">XS</Button>
      <Button variant="primary" size="sm">SM</Button>
      <Button variant="primary" size="md">MD</Button>
      <Button variant="primary" size="lg">LG</Button>
    </div>
  ),
};
