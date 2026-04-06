import { type FC } from "react";
import { cn } from "@utils/classNames";

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
};

export const Avatar: FC<AvatarProps> = ({
  src,
  alt = "User avatar",
  initials,
  size = "md",
  className,
}) => {
  const baseClasses =
    "rounded-full overflow-hidden flex items-center justify-center font-semibold select-none";

  if (src) {
    return (
      <div className={cn(baseClasses, sizeClasses[size], className)}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        sizeClasses[size],
        "bg-gradient-to-br from-blue-500 to-purple-600 text-white",
        className
      )}
    >
      {initials || "U"}
    </div>
  );
};
