import { FC, useState, useEffect, useRef, MouseEvent } from "react";
import { ChevronDown, Edit, Plus, Trash, X, Search } from "lucide-react";
import { cn } from "@/utils/classNames";

interface Option {
  id: string;
  name: string;
}

type Mode = "full" | "create-edit" | "selection-only";

interface SearchableMultiSelectProps {
  label: string;
  options: Option[];
  selectedOptions?: Option[];
  onSelect?: (option: Option) => void;
  onSelectionChange?: (options: Option[]) => void;
  onAddNew?: () => void;
  onEdit?: (option: Option) => void;
  onDelete?: (option: Option) => void;
  placeholder?: string;
  isMultiSelect?: boolean;
  mode?: Mode;
  disabled?: boolean;
  showSelectedTags?: boolean;
}

export const SearchableMultiSelect: FC<SearchableMultiSelectProps> = ({
  label,
  options,
  selectedOptions = [],
  onSelect,
  onSelectionChange,
  onAddNew,
  onEdit,
  onDelete,
  placeholder = "Search...",
  isMultiSelect = false,
  mode = "full",
  disabled = false,
  showSelectedTags = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options
    .filter((option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 5); // Show only 5 options as per requirements

  // Prevent any click within this component from submitting the form
  const stopPropagation = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const toggleDropdown = (e: MouseEvent<HTMLElement>) => {
    if (disabled) return;

    stopPropagation(e);
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Focus on search input when opening dropdown
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    }
  };

  const handleOptionSelect = (option: Option, e: MouseEvent<HTMLElement>) => {
    stopPropagation(e);

    if (mode === "create-edit") {
      // In create-edit mode, clicking an option will edit it
      if (onEdit) {
        onEdit(option);
      }
      return;
    }

    if (onSelectionChange) {
      const isSelected = selectedOptions.some((item) => item.id === option.id);

      if (isSelected) {
        onSelectionChange([
          ...selectedOptions.filter((item) => item.id !== option.id),
        ]);
      } else {
        onSelectionChange([...selectedOptions, option]);
      }

      // Si no es multi-select, cerramos el dropdown después de la selección
      if (!isMultiSelect) {
        setIsOpen(false);
      }
    } else if (onSelect) {
      // Solo si no hay onSelectionChange, usamos onSelect
      onSelect(option);
      setIsOpen(false);
    }
  };

  const handleRemoveOption = (optionId: string, e: MouseEvent<HTMLElement>) => {
    stopPropagation(e);

    if (isMultiSelect && onSelectionChange) {
      onSelectionChange(selectedOptions.filter((item) => item.id !== optionId));
    }
  };

  const handleAddNewClick = (e: MouseEvent<HTMLElement>) => {
    stopPropagation(e);
    if (onAddNew) {
      onAddNew();
    }
    if (!isMultiSelect) {
      setIsOpen(false);
    }
  };

  const handleEditClick = (option: Option, e: MouseEvent<HTMLElement>) => {
    stopPropagation(e);
    if (onEdit) {
      onEdit(option);
    }
  };

  // Nuevo handler para eliminación
  const handleDeleteClick = (option: Option, e: MouseEvent<HTMLElement>) => {
    stopPropagation(e);
    if (onDelete) {
      onDelete(option);
    }
  };

  const isOptionSelected = (option: Option) => {
    return selectedOptions.some((item) => item.id === option.id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handler for the search input to prevent form submission
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault(); // Prevent default behavior
    setSearchTerm(e.target.value);
  };

  return (
    <div
      className={`relative w-full ${disabled ? "opacity-70" : ""}`}
      ref={dropdownRef}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
    >
      {/* Dropdown Button */}
      <div
        className={cn(
          "w-full py-3.5 pl-4 pr-11 flex items-center justify-between gap-3 transition-all duration-300 ease-out-expo text-[15px] border-2 rounded-2xl relative",
          disabled
            ? "cursor-not-allowed opacity-50 bg-gray-50 dark:bg-gray-950"
            : "cursor-pointer bg-white dark:bg-gray-800/50",
          isOpen
            ? "border-primary-500"
            : "border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md"
        )}
        onClick={toggleDropdown}
      >
        <span
          className={cn(
            "truncate flex-1 text-left",
            selectedOptions.length === 0
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-900 dark:text-white font-medium"
          )}
        >
          {label}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-gray-400 transition-transform duration-300 absolute right-4 top-1/2 -translate-y-1/2",
            isOpen && "rotate-180 text-primary-500"
          )}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-[200] w-full mt-2 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={stopPropagation}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary-500 text-gray-900 dark:text-white placeholder:text-gray-400"
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={stopPropagation}
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5 custom-scrollbar">
            {/* Options List */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer mb-0.5 group",
                    isOptionSelected(option)
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                  onClick={(e) => handleOptionSelect(option, e)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate">{option.name}</span>
                  </div>
                  {(mode === "full" || mode === "create-edit") && (
                    <div className="flex items-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity gap-1">
                      {onEdit && (
                        <button
                          type="button"
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                          onClick={(e) => handleEditClick(option, e)}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                          onClick={(e) => handleDeleteClick(option, e)}
                          title="Eliminar"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-gray-400 text-center text-sm">
                No se encontraron opciones
              </div>
            )}

            {/* Add New Option (as a button inside the list like a special item) */}
            {(mode === "full" || mode === "create-edit") && onAddNew && (
              <div className="pt-1 mt-1 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleAddNewClick}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar nueva</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected options display */}
      {isMultiSelect &&
        selectedOptions.length > 0 &&
        mode !== "create-edit" &&
        showSelectedTags && (
          <div
            className="mt-2.5 flex flex-wrap gap-2 px-1"
            onClick={stopPropagation}
          >
            {selectedOptions.map((option) => (
              <span
                key={option.id}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all duration-300",
                  "bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-200 group/tag"
                )}
                onClick={stopPropagation}
              >
                <span className="truncate max-w-[150px]">{option.name}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveOption(option.id, e)}
                  className="p-0.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
    </div>
  );
};
