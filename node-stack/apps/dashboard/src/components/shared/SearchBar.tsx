import { FC, ReactNode } from "react";
import { AdminToolbar } from "../toolbar/AdminToolbar";
import { ViewMode } from "../toolbar/ViewToggle";

export interface SearchBarTag {
  id: string;
  label: string;
}

export interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onClear: () => void;
  isSearching?: boolean;
  resultsCount?: number;
  showResultsCount?: boolean;
  placeholder?: string;

  tags?: SearchBarTag[];
  activeTagId?: string;
  onTagChange?: (tagId: string) => void;

  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;

  onCreate?: () => void;
  createButtonText?: string;
  createButtonIcon?: ReactNode;
  showCreateButton?: boolean;
}

export const SearchBar: FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  onClear,
  isSearching = false,
  resultsCount,
  showResultsCount = false,
  placeholder = "Buscar...",
  tags = [],
  activeTagId,
  onTagChange,
  viewMode,
  onViewModeChange,
  onCreate,
  createButtonText = "Crear nuevo",
  createButtonIcon,
  showCreateButton = false,
}) => {
  const actionButton =
    showCreateButton && onCreate ? (
      <button
        type="button"
        onClick={onCreate}
        className="flex items-center justify-center gap-2 w-full sm:w-auto h-10 px-4 sm:px-5 rounded-full text-sm font-heading bg-primary hover:opacity-90 text-white shadow-sm transition-transform duration-200 ease-in-out hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {createButtonIcon && (
          <span className="shrink-0">{createButtonIcon}</span>
        )}
        <span className="whitespace-nowrap">{createButtonText}</span>
      </button>
    ) : null;

  return (
    <div className="flex flex-col gap-2 sm:gap-3 w-full">
      <AdminToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={onClear}
        searchPlaceholder={placeholder}
        isSearching={isSearching}
        tags={tags}
        activeTagId={activeTagId}
        onTagChange={onTagChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        action={actionButton}
      />
      {showResultsCount && searchTerm && resultsCount !== undefined && (
        <div className="px-2 sm:px-3 animate-fade-in transition-all duration-200">
          <p className="text-xs font-label text-primary ">
            {resultsCount} resultado{resultsCount !== 1 ? "s" : ""} encontrado
            {resultsCount !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
};
