import { FC } from "react";

import { cn } from "@/utils/classNames";

export interface FilterTag {
  id: string;
  label: string;
}

interface FilterTagsProps {
  tags: FilterTag[];
  activeTagId?: string;
  onTagChange: (id: string) => void;
  className?: string;
}

export const FilterTags: FC<FilterTagsProps> = ({
  tags,
  activeTagId,
  onTagChange,
  className,
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-wrap items-center gap-2 py-1">
        {tags.map((tag) => {
          const isActive = activeTagId === tag.id;
          return (
            <button
              key={tag.id}
              onClick={() => onTagChange(tag.id)}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-sm font-label border transition-colors whitespace-nowrap active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-primary",                isActive
                  ? "bg-primary border-primary text-white shadow-sm dark:bg-primary dark:border-primary"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
