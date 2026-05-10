import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Sparkles, Star, Zap } from "lucide-react";

import { Button } from "../components/ui/Button.js";
import { CalloutCard } from "../components/ui/CalloutCard.js";

const meta: Meta<typeof CalloutCard> = {
  title: "UI/CalloutCard",
  component: CalloutCard,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["card", "muted", "promo"] },
    layout: { control: "select", options: ["vertical", "horizontal"] },
    iconTone: { control: "select", options: ["primary", "success", "info", "warning", "neutral"] },
  },
};

export default meta;
type Story = StoryObj<typeof CalloutCard>;

export const Default: Story = {
  args: {
    icon: Bell,
    title: "Enable Notifications",
    description: "Stay informed about important events in your workspace.",
  },
};

export const WithAction: Story = {
  args: {
    icon: Zap,
    iconTone: "primary",
    title: "Upgrade to Pro",
    description: "Unlock unlimited projects, advanced analytics, and priority support.",
    action: <Button size="sm">Upgrade Now</Button>,
  },
};

export const Promo: Story = {
  args: {
    icon: Sparkles,
    iconTone: "warning",
    variant: "promo",
    title: "50% off Annual Plan",
    description: "Switch to annual billing and save half the cost.",
    action: <Button size="sm">Claim Offer</Button>,
  },
};

export const Muted: Story = {
  args: {
    icon: Star,
    variant: "muted",
    title: "Rate Your Experience",
    description: "Help us improve by sharing your feedback.",
    action: <Button size="sm" variant="ghost">Give Feedback</Button>,
  },
};

export const Horizontal: Story = {
  args: {
    icon: Bell,
    layout: "horizontal",
    title: "New Updates Available",
    description: "Version 2.5.0 introduces improved performance and bug fixes.",
    action: <Button size="sm" variant="secondary">View Changelog</Button>,
  },
};
