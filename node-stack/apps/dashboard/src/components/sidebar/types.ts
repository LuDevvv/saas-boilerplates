import { User as UserType } from "@node-stack/types";
import { LucideIcon } from "lucide-react";
import React from "react";

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  menuSections?: MenuSection[];
  currentPath?: string;
}

export interface SidebarItemProps {
  id?: string;
  level?: number;
  icon?: LucideIcon;
  label: string;
  path?: string;
  badge?: string | number;
  subItems?: SubMenuItem[];
  isCollapsed?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export interface SubMenuItem {
  id: string;
  label: string;
  path: string;
  icon?: LucideIcon;
  subItems?: SubMenuItem[];
}

export interface MenuSection {
  title?: string;
  items: SidebarItemProps[];
  isCollapsed?: boolean;
}

export interface SidebarSectionProps {
  title?: string;
  isCollapsed?: boolean;
  children: React.ReactNode;
}

export interface AccountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isPremium: boolean;
  currentPlan: any | null;
  onLogout: () => void;
  items: DropdownItem[];
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export interface AccountSectionProps {
  isCollapsed: boolean;
  isPremium: boolean;
  user: UserType | null | undefined;
  currentPlan: any | null;
  onLogout: () => void;
  dropdownItems: DropdownItem[];
}

export interface DropdownItem {
  icon?: LucideIcon;
  label: string;
  path: string;
  showOnlyForFree?: boolean;
  showOnlyForPremium?: boolean;
  highlight?: boolean;
}
