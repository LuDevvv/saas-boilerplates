import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components/ui/Button.js";
import { PageHeader } from "../components/ui/PageHeader.js";

const meta: Meta<typeof PageHeader> = {
  title: "UI/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: "Dashboard",
    description: "Monitor your application's performance and activity.",
  },
};

export const WithEyebrow: Story = {
  args: {
    eyebrow: "WORKSPACE",
    title: "Team Settings",
    description: "Manage members, permissions, and workspace preferences.",
  },
};

export const WithAction: Story = {
  args: {
    eyebrow: "BILLING",
    title: "Subscription",
    description: "Manage your plan, invoices, and payment methods.",
    action: <Button>Upgrade Plan</Button>,
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    title: "Edit Profile",
    breadcrumbs: [
      { label: "Settings", href: "/settings" },
      { label: "Profile", href: "/settings/profile" },
    ],
  },
};
