import { User } from "@/types/auth";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export interface SubMenuItem {
  id?: string;
  icon?: LucideIcon;
  label: string;
  path: string;
  subItems?: SubMenuItem[];
}

export interface MenuItem {
  id?: string;
  icon: LucideIcon;
  label: string;
  path?: string;
  badge?: string;
  subItems?: SubMenuItem[];
}

export interface MenuSection {
  title: string;
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
  user: User | null;
  onLogout: () => void;
  dropdownItems: DropdownItem[];
  isPremium?: boolean;
  currentPlan?: any;
}

export interface SidebarSectionProps {
  title: string;
  children: ReactNode;
  isCollapsed: boolean;
}

export interface AccountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  items: DropdownItem[];
  triggerRef: React.RefObject<HTMLButtonElement>;
  isPremium?: boolean;
  currentPlan?: any;
}

export interface DropdownItem {
  icon: LucideIcon;
  label: string;
  path: string;
  highlight?: boolean;
}
