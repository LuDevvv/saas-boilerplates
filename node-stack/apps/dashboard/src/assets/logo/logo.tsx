import { FC } from "react";

import logoCompleto from "./nodestack-logo-completo.png";
import logoSolo from "./nodestack-logo-solo.png";

import { cn } from "@/utils/classNames";

interface LogoProps {
  variant?: "solo" | "full";
  className?: string;
  imgClassName?: string;
  width?: number | string;
  height?: number | string;
}

export const Logo: FC<LogoProps> = ({
  variant = "full",
  className,
  imgClassName,
  width,
  height
}) => {
  const src = variant === "solo" ? logoSolo : logoCompleto;

  return (
    <div className={cn("flex items-center select-none", className)}>
      <img
        src={src}
        alt="Elora Logo"
        className={cn(
          "object-contain dark:brightness-0 dark:invert transition-all duration-300",
          imgClassName
        )}
        style={{
          width: width || (variant === "solo" ? "40px" : "160px"),
          height: height || "40px"
        }}
      />
    </div>
  );
};

export default Logo;
