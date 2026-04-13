import { FC } from "react";
import { List, LayoutGrid } from "lucide-react";
import { cn } from "@/utils/classNames";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export const ViewToggle: FC<ViewToggleProps> = ({
  mode,
  onChange,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-1 shrink-0", className)}>
      <button
        onClick={() => onChange("list")}
        className={cn(
          "p-1.5 rounded-full transition-colors active:scale-95",
          mode === "list"
            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
        )}
        aria-label="Vista de lista"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "p-1.5 rounded-full transition-colors active:scale-95",
          mode === "grid"
            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
        )}
        aria-label="Vista de cuadrícula"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
    </div>
  );
};
