import { FC, useMemo } from "react";
import { LinkTransition } from "@/components/utils/LinkTransition";
import { useLocation } from "react-router-dom";
import { Breadcrumbs as SharedBreadcrumbs, BreadcrumbItem } from "@node-stack/ui";

export const Breadcrumbs: FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // If we are on dashboard (/) we don't show breadcrumbs
  if (pathnames.length === 0) return null;

  const getLabel = (path: string) => {
    const labels: Record<string, string> = {
      analytics: "Analíticas",
      payments: "Pagos",
      history: "Historial de Pagos",
      "current-plan": "Plan Actual",
      methods: "Métodos de Pago",
      profile: "Perfil",
      personal: "Información Personal",
      company: "Datos de Empresa",
      settings: "Ajustes",
      notifications: "Notificaciones",
      dashboard: "Panel",
    };

    const label = labels[path] || path.charAt(0).toUpperCase() + path.slice(1);
    return (
      <span className="uppercase text-[10px] font-label">
        {label}
      </span>
    );
  };

  const NON_CLICKABLE_SEGMENTS = ["profile", "payments"];

  const items = useMemo<BreadcrumbItem[]>(() => {
    return pathnames.map((value, index) => {
      const isLast = index === pathnames.length - 1;
      const href = !isLast && !NON_CLICKABLE_SEGMENTS.includes(value)
        ? `/${pathnames.slice(0, index + 1).join("/")}`
        : undefined;
      
      return {
        label: getLabel(value),
        href,
        isLast,
      };
    });
  }, [pathnames]);

  return (
    <SharedBreadcrumbs 
      items={items} 
      LinkComponent={({ href, children, className }) => (
        <LinkTransition href={href} className={className}>
          {children}
        </LinkTransition>
      )}
    />
  );
};
