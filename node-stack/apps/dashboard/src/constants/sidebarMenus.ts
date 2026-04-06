import { Home, Building2, Users, Settings, Layout, Puzzle } from "lucide-react";
import { MenuSection } from "../components/sidebar/types";

export const MAIN_MENU_SECTIONS: MenuSection[] = [
  {
    title: "Main",
    items: [
      { icon: Home, label: "Dashboard", path: "/" },
      { icon: Building2, label: "Workspaces", path: "/workspaces" },
    ],
  },
  {
    title: "Management",
    items: [
      { icon: Users, label: "Members", path: "/workspaces" },
      { icon: Settings, label: "Settings", path: "/settings" },
    ],
  },
  {
    title: "Modules",
    items: [
      { icon: Puzzle, label: "Module Playground", path: "/modules" },
    ],
  },
];

export const ACCOUNT_MENU_ITEMS = [
  { icon: Layout, label: "Profile", path: "/settings/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];