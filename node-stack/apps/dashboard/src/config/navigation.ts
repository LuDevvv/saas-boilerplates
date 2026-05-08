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
      items: [
        { icon: ShieldAlert, label: "Sistema", path: "/admin" },
        { icon: Users, label: "Usuarios", path: "/admin/users" },
        { icon: Activity, label: "Auditoría", path: "/admin/audit" },
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
