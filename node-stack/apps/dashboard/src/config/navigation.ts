import {
  Building2,
  CreditCard,
  Crown,
  Home,
  PieChart,
  Settings,
  User,
  Users,
  Webhook,
  Key,
} from "lucide-react";
import {
  DropdownItem,
  MenuSection,
} from "@/components/sidebar/types";

/**
 * Genera la estructura de secciones y menús para el Dashboard de NodeStack.
 */
export const getMenuSections = (): MenuSection[] => {
  return [
    {
      title: "Principal",
      items: [
        { icon: Home, label: "Inicio", path: "/" },
        {
          icon: PieChart,
          label: "Analíticas",
          path: "/analytics",
          badge: "Nuevo",
        },
        {
          icon: Building2,
          label: "Almacenamiento",
          path: "/storage",
        },
      ],
    },
    {
      title: "Cuenta",
      items: [
        {
          icon: CreditCard,
          label: "Pagos",
          path: "/payments",
          badge: "3",
        },
        {
          icon: Settings,
          label: "Configuración",
          subItems: [
            { id: "personal-profile", icon: User, label: "Perfil Personal", path: "/profile/personal" },
            {
              id: "company-profile",
              icon: Building2,
              label: "Perfil Empresarial",
              path: "/profile/company",
            },
            {
              id: "workspace-members",
              icon: Users,
              label: "Miembros",
              path: "/settings/members",
            },
            {
              id: "workspace-api-keys",
              icon: Key,
              label: "Claves API",
              path: "/settings/api-keys",
            },
            {
              id: "workspace-webhooks",
              icon: Webhook,
              label: "Webhooks",
              path: "/settings/webhooks",
            },
          ],
        },
      ],
    },
  ];
};

export const accountDropdownItems: DropdownItem[] = [
  {
    icon: Crown,
    label: "Mejorar a Pro",
    path: "/pricing",
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
