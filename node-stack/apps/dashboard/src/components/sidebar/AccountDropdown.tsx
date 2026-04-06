import { FC, useEffect, useRef } from "react";
import LinkTransition from "../utils/LinkTransition";
import { LogOut } from "lucide-react";
import { cn } from "@/utils/classNames";
import { AccountDropdownProps } from "./types";
import { useSidebarStore } from "@/stores/sidebarStore";

export const AccountDropdown: FC<AccountDropdownProps> = ({
  isOpen,
  onClose,
  planName = "Free",
  onLogout,
  items,
  triggerRef,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { closeMobile } = useSidebarStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  const handleItemClick = () => {
    onClose(); // Close the dropdown
    closeMobile(); // Close the mobile sidebar if open
  };

  if (!isOpen) return null;

  // Generic filter: in the future we can use planName to hide certain items
  const filteredItems = items.filter(
    (item) => !item.showOnlyForFree || planName === "Free"
  );

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 overflow-hidden"
    >
      <div className="flex flex-col p-1">
        <div className="px-3 py-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Mi Cuenta
          </p>
        </div>

        {filteredItems.map((item, index) => (
          <LinkTransition
            key={index}
            href={item.path}
            className="w-full"
            callBack={handleItemClick}
          >
            <div className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <div
                className={cn(
                  "p-1.5 rounded-md",
                  item.highlight
                    ? "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                )}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  item.highlight
                    ? "text-violet-700 dark:text-violet-300 font-semibold"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                {item.label}
              </span>
            </div>
          </LinkTransition>
        ))}

        <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 cursor-pointer"
        >
          <div className="p-1.5 rounded-md bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <LogOut className="h-4 w-4" />
          </div>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};
