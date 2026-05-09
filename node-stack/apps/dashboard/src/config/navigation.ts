import {
  Building2,
  CreditCard,
  Crown,
  HardDrive,
  Home,
  PieChart,
  Sparkles,
  User,
  Users,
  ShieldAlert,
  Activity,
  Settings,
  Zap,
  LayoutGrid,
} from "lucide-react";

import {
  DropdownItem,
  MenuSection,
} from "@/components/sidebar/types";

export const getMenuSections = (): MenuSection[] => {
  return [
    {
      title: "Principal",
      items: [
        { icon: Home, label: "Inicio", path: "/" },
        { icon: PieChart, label: "Analíticas", path: "/analytics", badge: { label: "Nuevo", tone: "success" } },
        { icon: HardDrive, label: "Archivos", path: "/storage", badge: { label: "Beta", tone: "warning" } },
      ],
    },
    {
      title: "Perfil",
      items: [
        { icon: User, label: "Perfil", path: "/profile/personal" },
        { icon: Building2, label: "Empresa", path: "/profile/company" },
        { icon: Users, label: "Equipo", path: "/settings/members" },
      ],
    },
    {
      title: "Cuenta",
      items: [
        { icon: CreditCard, label: "Suscripción", path: "/payments", badge: { label: "3", tone: "primary" } },
        { icon: Sparkles, label: "Planes", path: "/pricing", badge: { label: "Pro", tone: "primary" } },
      ],
    },
    {
      title: "Admin",
      adminOnly: true,
      items: [
        { icon: ShieldAlert, label: "Sistema", path: "/admin" },
        { icon: Users, label: "Usuarios", path: "/admin/users" },
        { icon: LayoutGrid, label: "Workspaces", path: "/admin/workspaces" },
        { icon: Activity, label: "Auditoría", path: "/admin/audit" },
        { icon: Zap, label: "Feature Flags", path: "/admin/feature-flags" },
        { icon: Settings, label: "Configuración", path: "/admin/config" },
      ],
    },
  ];
};

export const accountDropdownItems: DropdownItem[] = [
  {
    icon: Crown,
    label: "Mejorar a Pro",
    path: "/payments/pricing",
    showOnlyForFree: true,
    highlight: true,
  },
  {
    icon: User,
    label: "Mi perfil",
    path: "/profile/personal",
  },
  {
    icon: Users,
    label: "Equipo",
    path: "/settings/members",
  },
];
