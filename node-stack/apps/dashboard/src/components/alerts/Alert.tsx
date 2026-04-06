import { type FC, type ReactNode } from "react";
import { X, AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@utils/classNames";

interface AlertProps {
  variant?: "info" | "warning" | "success" | "danger";
  title?: string;
  children: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles = {
  info: {
    container: "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800",
    iconContainer:
      "bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400",
    title: "text-gray-900 dark:text-white",
    text: "text-gray-600 dark:text-gray-400",
    button:
      "text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
    defaultIcon: Info,
  },
  warning: {
    container: "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800",
    iconContainer:
      "bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400",
    title: "text-gray-900 dark:text-white",
    text: "text-gray-600 dark:text-gray-400",
    button:
      "text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
    defaultIcon: AlertTriangle,
  },
  success: {
    container: "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800",
    iconContainer:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400",
    title: "text-gray-900 dark:text-white",
    text: "text-gray-600 dark:text-gray-400",
    button:
      "text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
    defaultIcon: CheckCircle,
  },
  danger: {
    container: "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800",
    iconContainer:
      "bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400",
    title: "text-gray-900 dark:text-white",
    text: "text-gray-600 dark:text-gray-400",
    button:
      "text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
    defaultIcon: AlertCircle,
  },
};

export const Alert: FC<AlertProps> = ({
  variant = "info",
  title,
  children,
  icon: CustomIcon,
  onDismiss,
  className,
}) => {
  const styles = variantStyles[variant];
  const IconComponent = CustomIcon || styles.defaultIcon;

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-4 sm:p-5 transition-all duration-300",
        "shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]",
        "animate-in fade-in slide-in-from-top-2 duration-400",
        styles.container,
        className
      )}
      role="alert"
    >
      <div className="flex gap-4 sm:gap-5">
        {/* Icon Container */}
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:rotate-3",
            styles.iconContainer
          )}
        >
          <IconComponent
            className="w-5 h-5 sm:w-5.5 sm:h-5.5"
            strokeWidth={2}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          {title && (
            <h3
              className={cn(
                "text-sm sm:text-base font-bold mb-1 tracking-tight leading-snug",
                styles.title
              )}
            >
              {title}
            </h3>
          )}
          <div
            className={cn(
              "text-xs sm:text-sm font-medium leading-relaxed opacity-90",
              styles.text
            )}
          >
            {children}
          </div>
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <div className="flex-shrink-0">
            <button
              onClick={onDismiss}
              className={cn(
                "rounded-xl p-1.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-90",
                styles.button
              )}
              aria-label="Cerrar alerta"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
