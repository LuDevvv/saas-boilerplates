import React, { FC, ReactNode } from "react";
import { cn } from "../../utils.js";

export type HeroBannerColorScheme =
  | "violet"
  | "indigo"
  | "indigo-blue"
  | "purple"
  | "blue"
  | "amber"
  | "fintech"
  | "primary";

export interface HeroBannerProps {
  icon: ReactNode;
  label: string;
  title: string;
  titleHighlight: string;
  description: string;
  colorScheme?: HeroBannerColorScheme;
  action?: ReactNode;
  headerExtra?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const schemes: Record<
  HeroBannerColorScheme,
  {
    container: string;
    blob1: string;
    blob2: string;
    badge: string;
    icon: string;
    label: string;
    gradient: string;
  }
> = {
  violet: {
    container:
      "from-violet-50 via-purple-50 to-white dark:from-violet-950/40 dark:via-purple-900/30 dark:to-gray-900 border-violet-100 dark:border-white/5",
    blob1: "bg-[#8C5BFF]/15 dark:bg-[#8C5BFF]/10",
    blob2: "bg-[#A78BFA]/15 dark:bg-[#A78BFA]/10",
    badge: "border-violet-100 dark:border-white/10",
    icon: "text-[#8C5BFF] dark:text-[#A78BFA]",
    label: "text-[#8C5BFF] dark:text-[#A78BFA]",
    gradient: "from-[#8C5BFF] to-[#A78BFA]",
  },
  indigo: {
    container:
      "from-indigo-50 via-purple-50 to-white dark:from-indigo-950/40 dark:via-purple-900/30 dark:to-gray-900 border-indigo-100 dark:border-white/5",
    blob1: "bg-indigo-300/20 dark:bg-indigo-600/10",
    blob2: "bg-purple-300/20 dark:bg-purple-600/10",
    badge: "border-indigo-100 dark:border-white/10",
    icon: "text-indigo-600 dark:text-indigo-400",
    label: "text-indigo-700 dark:text-indigo-300",
    gradient:
      "from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400",
  },
  "indigo-blue": {
    container:
      "from-indigo-50 via-blue-50 to-white dark:from-indigo-950/40 dark:via-blue-900/30 dark:to-gray-900 border-indigo-100 dark:border-white/5",
    blob1: "bg-indigo-500/15 dark:bg-indigo-400/10",
    blob2: "bg-blue-500/15 dark:bg-blue-400/10",
    badge: "border-indigo-100 dark:border-white/10",
    icon: "text-indigo-600 dark:text-indigo-400",
    label: "text-indigo-700 dark:text-indigo-300",
    gradient:
      "from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400",
  },
  purple: {
    container:
      "from-purple-50 via-fuchsia-50 to-white dark:from-purple-950/40 dark:via-fuchsia-900/30 dark:to-gray-900 border-purple-100 dark:border-white/5",
    blob1: "bg-purple-500/15 dark:bg-purple-400/10",
    blob2: "bg-fuchsia-500/15 dark:bg-fuchsia-400/10",
    badge: "border-purple-100 dark:border-white/10",
    icon: "text-purple-600 dark:text-purple-400",
    label: "text-purple-700 dark:text-purple-300",
    gradient:
      "from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400",
  },
  blue: {
    container:
      "from-blue-50 via-sky-50 to-white dark:from-blue-950/40 dark:via-sky-900/30 dark:to-gray-900 border-blue-100 dark:border-white/5",
    blob1: "bg-blue-500/15 dark:bg-blue-400/10",
    blob2: "bg-sky-500/15 dark:bg-sky-400/10",
    badge: "border-blue-100 dark:border-white/10",
    icon: "text-blue-600 dark:text-blue-400",
    label: "text-blue-700 dark:text-blue-300",
    gradient: "from-blue-600 to-sky-600 dark:from-blue-400 dark:to-sky-400",
  },
  amber: {
    container:
      "from-amber-50 via-orange-50 to-white dark:from-amber-950/40 dark:via-orange-900/30 dark:to-gray-900 border-amber-100 dark:border-white/5",
    blob1: "bg-amber-500/15 dark:bg-amber-400/10",
    blob2: "bg-orange-500/15 dark:bg-orange-400/10",
    badge: "border-amber-100 dark:border-white/10",
    icon: "text-amber-600 dark:text-amber-400",
    label: "text-amber-700 dark:text-amber-300",
    gradient:
      "from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400",
  },
  fintech: {
    container:
      "from-[#004080]/5 via-blue-50/30 to-white dark:from-[#004080]/20 dark:via-gray-900 dark:to-gray-900 border-[#004080]/10 dark:border-white/5",
    blob1: "bg-[#004080]/10 dark:bg-[#004080]/5",
    blob2: "bg-[#7144F9]/10 dark:bg-[#7144F9]/5",
    badge: "border-[#004080]/10 dark:border-white/10",
    icon: "text-[#004080] dark:text-blue-400",
    label: "text-[#004080] dark:text-blue-300",
    gradient: "from-[#004080] to-[#7144F9] dark:from-blue-400 dark:to-[#7144F9]",
  },
  primary: {
    container:
      "from-[var(--primary)]/5 via-blue-50/30 to-white dark:from-[var(--primary)]/20 dark:via-gray-900 dark:to-gray-900 border-[var(--primary)]/10 dark:border-white/5",
    blob1: "bg-[var(--primary)]/10 dark:bg-[var(--primary)]/5",
    blob2: "bg-[#7144F9]/10 dark:bg-[#7144F9]/5",
    badge: "border-[var(--primary)]/10 dark:border-white/10",
    icon: "text-[var(--primary)] dark:text-blue-400",
    label: "text-[var(--primary)] dark:text-blue-300",
    gradient: "from-[var(--primary)] to-[#7144F9] dark:from-blue-400 dark:to-[#7144F9]",
  },
};

export const HeroBanner: FC<HeroBannerProps> = ({
  icon,
  label,
  title,
  titleHighlight,
  description,
  colorScheme = "blue",
  action,
  headerExtra,
  children,
  className,
}) => {
  const s = schemes[colorScheme];

  const badge = (
    <div
      className={cn(
        "flex items-center gap-2 w-fit bg-white/80 dark:bg-white/10 backdrop-blur-sm border rounded-full px-3 py-1 shadow-sm",
        s.badge
      )}
    >
      <span className={cn("[&>svg]:w-5 [&>svg]:h-5", s.icon)}>{icon}</span>
      <span className={cn("text-[10px] font-label uppercase tracking-widest text-gray-400 dark:text-gray-500")}>
        {label}
      </span>
    </div>
  );

  return (
    <div
      className={cn(
        "relative rounded-[32px] overflow-hidden bg-gradient-to-br border shadow-sm transition-all duration-300",
        s.container,
        className
      )}
    >
      {/* Decorative blobs */}
      <div
        className={cn(
          "absolute -top-12 -right-12 w-56 h-56 rounded-full blur-3xl pointer-events-none",
          s.blob1
        )}
      />
      <div
        className={cn(
          "absolute bottom-0 left-1/4 w-40 h-40 rounded-full blur-2xl pointer-events-none",
          s.blob2
        )}
      />

      <div className="relative z-10 p-6 sm:p-10 flex flex-col gap-4 min-w-0">
        {headerExtra ? (
          <div className="flex items-center justify-between w-full">
            {badge}
            {headerExtra}
          </div>
        ) : (
          badge
        )}

        <h1 className="text-2xl sm:text-4xl font-heading text-gray-950 dark:text-white leading-[1.1] break-words">
          {title}{" "}
          <span
            className={cn(
              "block sm:inline text-transparent bg-clip-text bg-gradient-to-r",
              s.gradient
            )}
          >
            {titleHighlight}
          </span>
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-[15px] font-label leading-relaxed max-w-2xl">          {description}
        </p>

        {(action || children) && (
          <div className="flex flex-wrap items-center gap-4 mt-2">
            {action}
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export interface HeroButtonProps {
  label: string;
  icon?: ReactNode;
  color?: "cyan" | "purple" | "indigo" | "blue";
  onClick?: () => void;
  className?: string;
}

export const HeroButton: FC<HeroButtonProps> = ({
  label,
  icon,
  color = "cyan",
  onClick,
  className,
}) => {
  const colorStyles = {
    cyan: "bg-gradient-to-r from-[#00e0c4] to-emerald-400 hover:from-[#00c2a8] hover:to-emerald-500 shadow-lg shadow-[#00e0c4]/20",
    purple:
      "bg-gradient-to-r from-[#8C5BFF] to-indigo-500 hover:from-[#7c4df0] hover:to-indigo-600 shadow-lg shadow-[#8C5BFF]/20",
    indigo:
      "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-500/20",
    blue: "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/20",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-heading uppercase tracking-widest transition-all duration-300 active:scale-[0.98] w-fit hover:translate-y-[-1px]",
        colorStyles[color],
        className
      )}
    >
      {icon && (
        <span className="[&>svg]:w-4 [&>svg]:h-4 [&>svg]:group-hover:rotate-12 [&>svg]:transition-transform">
          {icon}
        </span>
      )}
      {label}
    </button>
  );
};
