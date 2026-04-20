import {
  Home,
  User,
  Settings,
  Shield,
  Bell,
  CheckCircle,
  Clock,
  Layout,
  FileText
} from "lucide-react";
import {
  DropdownItem,
  MenuSection,
} from "@/components/sidebar/types";

/**
 * Generates the menu sections for the Dashboard Boilerplate.
 */
export const getMenuSections = (): MenuSection[] => {
  return [
    {
      title: "Main",
      items: [
        { icon: Home, label: "Overview", path: "/" },
        { icon: Layout, label: "Workspaces", path: "/workspaces" },
        { icon: Bell, label: "Notifications", path: "/notifications" },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          icon: Settings,
          label: "Organization",
          subItems: [
            { icon: Shield, label: "Security", path: "/organization/security" },
            { icon: Clock, label: "Audit Logs", path: "/organization/logs" },
          ],
        },
        {
          icon: User,
          label: "Profile",
          subItems: [
            { icon: User, label: "Personal", path: "/profile/personal" },
            { icon: FileText, label: "Billing", path: "/profile/billing" },
          ],
        },
      ],
    },
  ];
};

export const accountDropdownItems: DropdownItem[] = [
  {
    icon: User,
    label: "My Profile",
    path: "/profile/personal",
  },
  {
    icon: CheckCircle,
    label: "Upgrade Plan",
    path: "/pricing",
    highlight: true,
  },
];
