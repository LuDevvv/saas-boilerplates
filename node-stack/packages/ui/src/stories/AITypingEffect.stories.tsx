import type { Meta, StoryObj } from "@storybook/react";

import { AITypingEffect } from "../components/ui/AITypingEffect.js";

const meta: Meta<typeof AITypingEffect> = {
  title: "UI/AITypingEffect",
  component: AITypingEffect,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    color: { control: "select", options: ["blue", "gray", "gradient", "white"] },
    speed: { control: "select", options: ["slow", "normal", "fast"] },
  },
};

export default meta;
type Story = StoryObj<typeof AITypingEffect>;

export const Default: Story = { args: { size: "md", color: "blue", speed: "normal" } };

export const Gradient: Story = { args: { size: "md", color: "gradient", speed: "normal" } };

export const Large: Story = { args: { size: "lg", color: "blue", speed: "slow" } };

export const Fast: Story = { args: { size: "md", color: "gray", speed: "fast" } };

export const AllColors: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", padding: "16px", background: "#1f2937", borderRadius: "8px" }}>
      <AITypingEffect size="md" color="blue" />
      <AITypingEffect size="md" color="gray" />
      <AITypingEffect size="md" color="gradient" />
      <AITypingEffect size="md" color="white" />
    </div>
  ),
};
