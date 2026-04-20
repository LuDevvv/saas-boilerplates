import { FC, ReactNode } from "react";
import { cn } from "@/utils/classNames";

interface HeroButtonProps {
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
    cyan: "bg-gradient-to-r from-[#00e0c4] to-emerald-400 hover:from-[#00c2a8] hover:to-emerald-500 shadow-md shadow-[#00e0c4]/30",
    purple:
      "bg-gradient-to-r from-[#8C5BFF] to-indigo-500 hover:from-[#7c4df0] hover:to-indigo-600 shadow-md shadow-[#8C5BFF]/30",
    indigo:
      "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-500/30",
    blue: "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/30",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 active:scale-[0.98] w-fit",
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
