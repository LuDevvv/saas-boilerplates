import {
  Building2,
  CreditCard,
  Crown,
  Home,
  PieChart,
  Sparkles,
  User,
  Users,
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
        { icon: PieChart, label: "Analíticas", path: "/analytics", badge: "Nuevo" },
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
        { icon: CreditCard, label: "Suscripción", path: "/payments", badge: "3" },
        { icon: Sparkles, label: "Planes", path: "/pricing" },
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
