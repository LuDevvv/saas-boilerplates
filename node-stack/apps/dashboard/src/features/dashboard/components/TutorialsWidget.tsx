import { FC } from "react";
import { BarChart3, BookOpen, ChevronRight, Clock, CreditCard, Rocket, Users } from "lucide-react";
import { cn } from "@/utils/classNames";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  icon: typeof Rocket;
  iconBg: string;
  iconColor: string;
}

const TUTORIALS: Tutorial[] = [
  {
    id: "1",
    title: "Primeros pasos en la plataforma",
    description: "Configura tu cuenta y descubre las funciones principales desde el inicio.",
    duration: "3 min",
    category: "Inicio",
    icon: Rocket,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    id: "2",
    title: "Invita y gestiona tu equipo",
    description: "Aprende a asignar roles y colaborar de forma eficiente con tus compañeros.",
    duration: "4 min",
    category: "Equipo",
    icon: Users,
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "3",
    title: "Configura tu suscripción",
    description: "Elige el plan correcto y añade tu método de pago de forma segura.",
    duration: "5 min",
    category: "Pagos",
    icon: CreditCard,
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "4",
    title: "Entiende tus analíticas",
    description: "Interpreta métricas clave para tomar mejores decisiones de negocio.",
    duration: "6 min",
    category: "Datos",
    icon: BarChart3,
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
];

export const TutorialsWidget: FC = () => {
  return (
    <div className="rounded-[20px] border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-[10px] bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-fg leading-snug">
              Guías y tutoriales
            </p>
            <p className="text-[11px] text-fg-muted mt-0.5">
              Aprende a sacar el máximo de la plataforma
            </p>
          </div>
        </div>
        <button className="shrink-0 flex items-center gap-1 text-[12px] font-medium text-primary hover:text-primary-600 transition-colors">
          Ver todas
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Tutorial list */}
      <div className="divide-y divide-border">
        {TUTORIALS.map((tutorial) => (
          <button
            key={tutorial.id}
            className="group w-full text-left flex items-center gap-3.5 px-5 py-3.5 hover:bg-surface-hover transition-colors duration-150"
          >
            {/* Icon */}
            <div
              className={cn(
                "h-8 w-8 rounded-[10px] flex items-center justify-center shrink-0",
                tutorial.iconBg
              )}
            >
              <tutorial.icon className={cn("h-4 w-4", tutorial.iconColor)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-fg leading-snug group-hover:text-primary transition-colors">
                {tutorial.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="h-3 w-3 text-fg-disabled shrink-0" />
                <span className="text-[11px] text-fg-muted">{tutorial.duration}</span>
                <span className="text-fg-disabled">·</span>
                <span className="text-[11px] text-fg-muted">{tutorial.category}</span>
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight
              className={cn(
                "h-4 w-4 shrink-0 transition-all duration-200",
                "text-fg-disabled",
                "group-hover:text-fg-secondary group-hover:translate-x-0.5"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
