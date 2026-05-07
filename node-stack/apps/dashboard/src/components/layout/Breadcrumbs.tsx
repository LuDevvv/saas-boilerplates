import { FC, useMemo } from "react";
import {
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  Crown,
  Download,
  FileText,
  Key,
  Newspaper,
  Plus,
  Settings,
  Shield,
  Sparkles,
  Ticket,
  User,
  Users,
  Webhook,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Breadcrumbs as SharedBreadcrumbs, BreadcrumbItem } from "@node-stack/ui";
import { LinkTransition } from "@/components/utils/LinkTransition";

// ─── Route metadata map ───────────────────────────────────────────────────────

type SegmentMeta = { label: string; icon?: LucideIcon; clickable?: boolean };

const SEGMENT_MAP: Record<string, SegmentMeta> = {
  // Analytics
  analytics:     { label: "Analíticas",          icon: BarChart3 },

  // Payments / Billing
  payments:      { label: "Suscripción",          icon: CreditCard, clickable: false },
  pricing:       { label: "Planes",               icon: Crown },
  history:       { label: "Historial",            icon: FileText },
  "current-plan":{ label: "Plan Actual",          icon: CreditCard },
  methods:       { label: "Métodos de Pago",      icon: CreditCard },
  checkout:      { label: "Pago",                 icon: CreditCard },

  // Profile
  profile:       { label: "Perfil",               icon: User, clickable: false },
  personal:      { label: "Información Personal", icon: User },
  company:       { label: "Empresa",              icon: Building2 },

  // Settings / Workspace
  settings:      { label: "Ajustes",              icon: Settings, clickable: false },
  members:       { label: "Equipo",               icon: Users },
  "api-keys":    { label: "Claves API",           icon: Key },
  webhooks:      { label: "Webhooks",             icon: Webhook },
  export:        { label: "Exportación de Datos", icon: Download },

  // Notifications & Tickets
  notifications: { label: "Notificaciones",       icon: Bell },
  tickets:       { label: "Soporte",              icon: Ticket },
  create:        { label: "Nuevo Ticket",         icon: Plus },

  // Other features
  reports:       { label: "Reportes",             icon: FileText },
  news:          { label: "Novedades",            icon: Newspaper },
  ai:            { label: "IA Playground",        icon: Sparkles },

  // Admin
  admin:         { label: "Administración",       icon: Shield, clickable: false },
  users:         { label: "Usuarios",             icon: Users },
  audit:         { label: "Auditoría",            icon: FileText },

  // Onboarding
  onboarding:    { label: "Bienvenida",           icon: Zap },

  // Legal
  legal:         { label: "Legal",                icon: FileText, clickable: false },
  terms:         { label: "Términos de Uso",      icon: FileText },
  privacy:       { label: "Privacidad",           icon: Shield },
};

function getSegmentMeta(segment: string): SegmentMeta {
  return (
    SEGMENT_MAP[segment] ?? {
      label: segment
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    }
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Breadcrumbs: FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  const items = useMemo<BreadcrumbItem[]>(() => {
    return pathnames.map((segment, index) => {
      const isLast = index === pathnames.length - 1;
      const meta = getSegmentMeta(segment);
      const isClickable = !isLast && meta.clickable !== false;

      return {
        label: meta.label,
        icon: meta.icon,
        href: isClickable
          ? `/${pathnames.slice(0, index + 1).join("/")}`
          : undefined,
        isLast,
      };
    });
  }, [pathnames]);

  // Root path → no breadcrumbs
  if (pathnames.length === 0) return null;

  return (
    <SharedBreadcrumbs
      items={items}
      collapseAfter={3}
      LinkComponent={({ href, children, className, title }) => (
        <LinkTransition href={href} className={className} title={title}>
          {children}
        </LinkTransition>
      )}
    />
  );
};
