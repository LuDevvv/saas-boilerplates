import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components/ui/Button.js";
import { SectionHeader } from "../components/ui/SectionHeader.js";

const meta: Meta<typeof SectionHeader> = {
  title: "UI/SectionHeader",
  component: SectionHeader,
  tags: ["autodocs"],
  argTypes: {
    as: { control: "select", options: ["h1", "h2", "h3"] },
    eyebrowTone: { control: "select", options: ["muted", "primary"] },
  },
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const Default: Story = {
  args: { title: "Recent Activity" },
};

export const WithEyebrow: Story = {
  args: {
    eyebrow: "FEATURES",
    title: "Everything you need",
    description: "A comprehensive set of tools to run your business efficiently.",
  },
};

export const WithAction: Story = {
  args: {
    title: "Team Members",
    description: "People with access to this workspace.",
    action: <Button size="sm">Invite</Button>,
  },
};

export const PrimaryEyebrow: Story = {
  args: {
    eyebrow: "NEW",
    eyebrowTone: "primary",
    title: "Introducing AI Features",
    description: "Leverage machine learning to automate repetitive tasks.",
  },
};
