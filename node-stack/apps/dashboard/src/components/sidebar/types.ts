import { User, Role } from "@/types/auth";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { Permission } from "@/config/permissions";

export interface SubMenuItem {
  id?: string;
  icon?: LucideIcon;
  label: string;
  path: string;
  permission?: Permission;
  subItems?: SubMenuItem[];
}

export interface MenuItem {
  id?: string;
  icon: LucideIcon;
  label: string;
  path?: string;
  badge?: string;
  permission?: Permission;
  subItems?: SubMenuItem[];
}

export interface MenuSection {
  title: string;
  permission?: Permission;
  items: MenuItem[];
}

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
  icon?: LucideIcon;
  label: string;
  path?: string;
  badge?: string;
  isActive: boolean;
  isCollapsed: boolean;
  subItems?: SubMenuItem[];
  level?: number;
}

export interface AccountSectionProps {
  isCollapsed: boolean;
  isPremium: boolean;
  user: User | null;
  planName?: string;
  onLogout: () => void;
  dropdownItems: DropdownItem[];
}

export interface SidebarSectionProps {
  title: string;
  children: ReactNode;
  isCollapsed: boolean;
}

export interface AccountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isPremium: boolean;
  planName?: string;
  onLogout: () => void;
  items: DropdownItem[];
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export interface DropdownItem {
  icon: LucideIcon;
  label: string;
  path: string;
  showOnlyForFree?: boolean;
  highlight?: boolean;
}
