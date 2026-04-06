import { FC, ReactNode } from "react";
import { SearchInput } from "./SearchInput";
import { FilterTags, FilterTag } from "./FilterTags";
import { ViewToggle, ViewMode } from "./ViewToggle";
import { cn } from "@/utils/classNames";

interface AdminToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  searchPlaceholder?: string;
  isSearching?: boolean;

  tags?: FilterTag[];
  activeTagId?: string;
  onTagChange?: (id: string) => void;

  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;

  action?: ReactNode;

  className?: string;
}

export const AdminToolbar: FC<AdminToolbarProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  searchPlaceholder,
  isSearching,
  tags = [],
  activeTagId,
  onTagChange,
  viewMode,
  onViewModeChange,
  action,
  className,
}) => {
  const hasViewToggle = viewMode !== undefined && onViewModeChange;
  const hasFilters = tags.length > 0 && onTagChange;
  const hasAction = !!action;

  return (
    <div
      role="toolbar"
      className={cn(
        "flex flex-col gap-3 sm:gap-4 w-full overflow-x-hidden",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
        <div className="flex items-center w-full sm:flex-1 min-w-0 max-w-md">
          <SearchInput
            className="flex-1 min-w-0"
            value={searchTerm}
            onChange={onSearchChange}
            onClear={onClearSearch}
            placeholder={searchPlaceholder}
            isLoading={isSearching}
            rightElement={
              hasViewToggle ? (
                <ViewToggle mode={viewMode} onChange={onViewModeChange} />
              ) : undefined
            }
          />
        </div>

        {hasAction && <div className="hidden sm:block shrink-0">{action}</div>}
      </div>

      {hasFilters && (
        <div className="w-full min-w-0">
          <FilterTags
            tags={tags}
            activeTagId={activeTagId}
            onTagChange={onTagChange}
          />
        </div>
      )}

      {hasAction && <div className="block sm:hidden w-full">{action}</div>}
    </div>
  );
};
