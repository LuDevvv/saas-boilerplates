import type { Meta, StoryObj } from "@storybook/react";

import { Breadcrumbs } from "../components/ui/Breadcrumbs.js";

const meta: Meta<typeof Breadcrumbs> = {
  title: "UI/Breadcrumbs",
  component: Breadcrumbs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  args: {
    items: [
      { label: "Dashboard", href: "/" },
      { label: "Settings", href: "/settings" },
      { label: "Profile", isLast: true },
    ],
  },
};

export const Short: Story = {
  args: {
    items: [
      { label: "Workspaces", href: "/workspaces" },
      { label: "My Workspace", isLast: true },
    ],
  },
};

export const Long: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Projects", href: "/projects" },
      { label: "Web App", href: "/projects/web" },
      { label: "Components", href: "/projects/web/components" },
      { label: "Button", isLast: true },
    ],
  },
};

export const WithHome: Story = {
  args: {
    showHome: true,
    homeHref: "/",
    items: [
      { label: "Billing", href: "/billing" },
      { label: "Invoices", isLast: true },
    ],
  },
};
