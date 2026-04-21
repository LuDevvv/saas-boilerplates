import {
  Home,
  Layout,
  Package,
  DollarSign,
  User,
  Settings,
  BarChart3,
  FileText,
} from "lucide-react";
import { MenuSection } from "../components/sidebar/types.js";

export const MAIN_MENU_SECTIONS: MenuSection[] = [
  {
    title: "Principal",
    items: [
      { icon: Home, label: "Inicio", path: "/" },
      { icon: Layout, label: "Workspaces", path: "/workspaces" },
    ],
  },
  {
    title: "Gestión",
    items: [
      { icon: Package, label: "Productos", path: "/products" },
      { icon: DollarSign, label: "Pagos", path: "/payments" },
    ],
  },
  {
    title: "Reportes",
    items: [
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
      { icon: FileText, label: "Reportes", path: "/reports" },
    ],
  },
];

export const ACCOUNT_MENU_ITEMS = [
  { icon: User, label: "Perfil", path: "/profile" },
  { icon: Layout, label: "Mis Workspaces", path: "/workspaces" },
  { icon: Settings, label: "Configuración", path: "/settings" },
];
