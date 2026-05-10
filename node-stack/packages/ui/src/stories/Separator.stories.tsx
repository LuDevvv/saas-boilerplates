import type { Meta, StoryObj } from "@storybook/react";

import { Separator } from "../components/ui/Separator.js";

const meta: Meta<typeof Separator> = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    decorative: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div style={{ width: "320px" }}>
      <p>Content above</p>
      <Separator />
      <p>Content below</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", height: "40px" }}>
      <span>Left</span>
      <Separator orientation="vertical" />
      <span>Right</span>
    </div>
  ),
};

export const InNav: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", height: "40px" }}>
      <a href="#">Home</a>
      <Separator orientation="vertical" />
      <a href="#">About</a>
      <Separator orientation="vertical" />
      <a href="#">Contact</a>
    </div>
  ),
};
