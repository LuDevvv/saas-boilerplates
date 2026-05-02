import { FC, useEffect, useRef } from "react";
import LinkTransition from "../utils/LinkTransition.js";
import { LogOut } from "lucide-react";
import { cn } from "@/utils/classNames";
import { AccountDropdownProps } from "./types.js";
import { useSidebarStore } from "@/stores/sidebarStore";

export const AccountDropdown: FC<AccountDropdownProps> = ({
  isOpen,
  onClose,
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

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-3 w-64 rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-900/10 dark:border-white/10 dark:bg-[#0A0A0A] dark:shadow-black/50 z-[100] animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden"
    >
      <div className="flex flex-col p-2">
        <div className="px-3 py-2 mb-1">
          <p className="text-[10px] font-label text-gray-400 uppercase ">
            Mi Cuenta
          </p>
        </div>

        {items.map((item, index) => (
          <LinkTransition
            key={index}
            href={item.path}
            className="w-full"
            callBack={handleItemClick}
          >
            <div className="group flex w-full items-center gap-3 px-3 py-2 rounded-xl text-left text-sm font-label text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-all duration-200 active:scale-[0.98]">
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-200",
                  item.highlight
                    ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                    : "bg-gray-100/50 text-gray-500 dark:bg-white/5 dark:text-gray-400 group-hover:bg-primary group-hover:text-white"
                )}
              >
                {item.icon && (() => {
                  const Icon = item.icon;
                  return <Icon className="h-4 w-4" />;
                })()}
              </div>
              <span
                className={cn(
                  "transition-colors duration-200",
                  item.highlight
                    ? "text-primary font-heading"
                    : "text-gray-700 dark:text-gray-300 group-hover:text-gray-950 dark:group-hover:text-white"
                )}
              >
                {item.label}
              </span>
            </div>
          </LinkTransition>
        ))}

        <div className="my-1.5 border-t border-gray-100 dark:border-white/5 mx-2" />

        <button
          onClick={onLogout}
          className="group flex w-full items-center gap-3 px-3 py-2 rounded-xl text-left text-sm font-label text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer transition-all duration-200 active:scale-[0.98]"
        >
          <div className="p-2 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white transition-all duration-200">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="group-hover:font-heading transition-all">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};
