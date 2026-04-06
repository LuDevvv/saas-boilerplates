import { FC } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/classNames";

interface CTAButtonProps {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  fullWidth?: boolean;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg" | "xl";
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}

export const CTAButton: FC<CTAButtonProps> = ({
  label,
  icon: Icon,
  href,
  onClick,
  fullWidth = false,
  variant = "primary",
  size = "md",
  className,
  disabled,
}) => {
  // tamaños del botón
  const sizeClasses = {
    sm: "text-xs px-3 py-2 h-8",
    md: "text-sm px-4 py-2 h-10",
    lg: "text-base px-5 py-3 h-12",
    xl: "text-lg px-6 py-4 h-14",
  };

  const baseStyles =
    "flex items-center justify-center gap-2 font-semibold rounded-md transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryStyles =
    "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400";
  const secondaryStyles =
    "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700";

  const buttonClasses = cn(
    baseStyles,
    sizeClasses[size],
    fullWidth && "w-full",
    variant === "primary" ? primaryStyles : secondaryStyles,
    className
  );

  if (href && !disabled) {
    return (
      <Link to={href} className={buttonClasses}>
        {Icon && <span>{Icon}</span>}
        <span className="truncate">{label}</span>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={buttonClasses} disabled={disabled}>
      {Icon && <span>{Icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
};
