import { FC, ReactNode } from "react";
import { cn } from "@/utils/classNames";

export type HeroBannerColorScheme =
  | "violet"
  | "indigo"
  | "indigo-blue"
  | "purple"
  | "blue"
  | "amber";

interface HeroBannerProps {
  /** Icon element for the badge pill (e.g. <BarChart3 />) */
  icon: ReactNode;
  /** Label text displayed in the badge pill */
  label: string;
  /** Title text (the non-gradient portion) */
  title: string;
  /** Highlighted portion of the title (rendered with a gradient) */
  titleHighlight: string;
  /** Description paragraph below the title */
  description: string;
  /** Predefined color scheme */
  colorScheme?: HeroBannerColorScheme;
  /** Optional call-to-action element (e.g. HeroButton) */
  action?: ReactNode;
  /** Optional element rendered beside the badge (e.g. branch indicator) */
  headerExtra?: ReactNode;
  /** Optional extra content after description & action */
  children?: ReactNode;
  /** Additional CSS classes for the outer container */
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
      <span className={cn("text-xs font-bold tracking-wide text-gray-400 dark:text-gray-500")}>
        {label}
      </span>
    </div>
  );

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden bg-gradient-to-br border shadow-sm",
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

      <div className="relative z-10 p-5 sm:p-8 flex flex-col gap-3 min-w-0">
        {headerExtra ? (
          <div className="flex items-center justify-between w-full">
            {badge}
            {headerExtra}
          </div>
        ) : (
          badge
        )}

        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight break-words">
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

        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
          {description}
        </p>

        {action}
        {children}
      </div>
    </div>
  );
};
