import {
  PieChart,
  Settings,
  User,
  Building2,
  Users,
  LayoutDashboard,
  Shield,
  CreditCard,
  History,
  Wallet,
  Brain,
} from "lucide-react";
import {
  DropdownItem,
  MenuSection,
} from "@/components/sidebar/types";

/**
 * Generic menu configuration for the sidebar.
 * This structure is used to generate the sidebar items dynamically.
 */
export const menuSections: MenuSection[] = [
  {
    title: "Main",
    items: [
      { 
        icon: LayoutDashboard, 
        label: "Dashboard", 
        path: "/",
        permission: "workspace.view"
      },
      {
        icon: PieChart,
        label: "Analytics",
        path: "/analytics",
        permission: "workspace.view"
      },
      {
        icon: Users,
        label: "Members",
        path: "/members",
        permission: "members.view"
      },
    ],
  },
  {
    title: "Intelligence",
    items: [
      {
        icon: Brain,
        label: "AI Playground",
        path: "/intelligence/playground",
        permission: "ai.execute"
      },
    ],
  },
  {
    title: "Organization",
    permission: "workspace.manage",
    items: [
      {
        icon: Building2,
        label: "Workspaces",
        path: "/workspaces",
        permission: "workspace.manage"
      },
      {
        icon: CreditCard,
        label: "Billing",
        permission: "billing.view",
        subItems: [
          {
            icon: Wallet,
            label: "Current Plan",
            path: "/billing/plan",
            permission: "billing.view"
          },
          {
            icon: History,
            label: "Payment History",
            path: "/billing/history",
            permission: "billing.view"
          },
        ],
      },
      {
        icon: Shield,
        label: "API & Webhooks",
        subItems: [
          {
            icon: Shield,
            label: "API Keys",
            path: "/workspaces/:id/settings/api-keys",
            permission: "api_keys.view"
          },
          {
            icon: Shield,
            label: "Webhooks",
            path: "/workspaces/:id/settings/webhooks",
            permission: "webhooks.view"
          },
        ],
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        icon: Settings,
        label: "Settings",
        subItems: [
          { 
            icon: User, 
            label: "Personal Profile", 
            path: "/settings/profile" 
          },
          {
            icon: Shield,
            label: "Security",
            path: "/settings/security",
          },
        ],
      },
    ],
  },
];

/**
 * Generic menu configuration for the top navbar account dropdown.
 */
export const accountDropdownItems: DropdownItem[] = [
  {
    icon: User,
    label: "My Profile",
    path: "/settings/profile",
  },
  {
    icon: Settings,
    label: "Account Settings",
    path: "/settings/security",
  },
];
