import { User, UserEntity } from "@node-stack/types";
import { LucideIcon } from "lucide-react";
import React from "react";

export type UserType = User | UserEntity;

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  menuSections?: MenuSection[];
  currentPath?: string;
}

export type SidebarBadgeTone = "primary" | "info" | "warning" | "success" | "neutral";

export interface SidebarBadge {
  label: string;
  tone?: SidebarBadgeTone;
}

export interface SidebarItemProps {
  id?: string;
  level?: number;
  icon?: LucideIcon;
  label: string;
  path?: string;
  /** String for legacy support, object form for tonal control. */
  badge?: string | number | SidebarBadge;
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
  /** When true, only renders for admin/super_admin roles */
  adminOnly?: boolean;
}

export interface SidebarSectionProps {
  title?: string;
  isCollapsed?: boolean;
  children: React.ReactNode;
}

export interface CurrentPlan {
  planId?: string;
  planName?: string;
  status?: string;
  currentPeriodEnd?: string;
}

export interface AccountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isPremium: boolean;
  currentPlan: CurrentPlan | null;
  onLogout: () => void;
  items: DropdownItem[];
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  user?: UserType | null;
  getFullName?: () => string;
}

export interface AccountSectionProps {
  isCollapsed: boolean;
  isPremium: boolean;
  user: UserType | null | undefined;
  currentPlan: CurrentPlan | null;
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
