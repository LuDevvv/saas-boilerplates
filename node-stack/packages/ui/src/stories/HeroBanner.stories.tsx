import type { Meta, StoryObj } from "@storybook/react";
import { Sparkles, Zap } from "lucide-react";

import { Button } from "../components/ui/Button.js";
import { HeroBanner } from "../components/ui/HeroBanner.js";

const meta: Meta<typeof HeroBanner> = {
  title: "UI/HeroBanner",
  component: HeroBanner,
  tags: ["autodocs"],
  argTypes: {
    colorScheme: {
      control: "select",
      options: ["violet", "indigo", "indigo-blue", "purple", "blue", "amber", "fintech", "primary"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof HeroBanner>;

export const Default: Story = {
  args: {
    icon: <Zap className="h-6 w-6" />,
    label: "AI-Powered",
    title: "Automate Your",
    titleHighlight: "Workflow",
    description: "Save hours every week with intelligent automation that adapts to your team's needs.",
    colorScheme: "violet",
    action: <Button>Get Started Free</Button>,
  },
};

export const Indigo: Story = {
  args: {
    icon: <Sparkles className="h-6 w-6" />,
    label: "NEW FEATURE",
    title: "Introducing",
    titleHighlight: "Smart Insights",
    description: "Real-time analytics that surface the metrics that matter most.",
    colorScheme: "indigo",
    action: <Button>Explore Features</Button>,
  },
};

export const Amber: Story = {
  args: {
    icon: <Sparkles className="h-6 w-6" />,
    label: "PREMIUM",
    title: "Unlock",
    titleHighlight: "Full Potential",
    description: "Upgrade your plan and access all premium features without limits.",
    colorScheme: "amber",
    action: <Button>Upgrade Now</Button>,
  },
};
