import { LogOut } from "lucide-react";
import { FC, useEffect, useRef } from "react";

import { AccountDropdownProps } from "./types.js";
import LinkTransition from "../utils/LinkTransition.js";

import { useSidebarStore } from "@/stores/sidebarStore";
import { cn } from "@/utils/classNames";



export const AccountDropdown: FC<AccountDropdownProps> = ({
  isOpen,
  onClose,
  isPremium,
  currentPlan,
  onLogout,
  items,
  triggerRef,
  user,
  getFullName,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { closeMobile } = useSidebarStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    if (item.showOnlyForFree && isPremium) return false;
    if (item.showOnlyForPremium && !isPremium) return false;
    return true;
  });

  const fullName = getFullName?.() || user?.email || "Usuario";
  const email = user?.email ?? "";
  const plan = isPremium ? (currentPlan?.planName ?? currentPlan?.planId ?? "Pro") : "Plan Gratuito";

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute top-full right-0 mt-2 w-[220px] max-w-[calc(100vw-1.5rem)]",
        "rounded-[16px] border border-border",
        "bg-surface-elevated",
        "shadow-[var(--shadow-elevated)]",
        "z-[100] overflow-hidden",
        "animate-in fade-in slide-in-from-top-2 duration-200"
      )}
    >
      {/* User info header */}
      <div className="px-4 py-3.5 border-b border-border">
        <p className="text-[13px] font-semibold text-fg truncate leading-snug">
          {fullName}
        </p>
        {email && (
          <p className="text-[12px] text-gray-400 truncate mt-0.5">{email}</p>
        )}
        <span className={cn(
          "inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium",
          isPremium
            ? "bg-primary/10 text-primary"
            : "bg-surface-hover text-gray-500"
        )}>
          {plan}
        </span>
      </div>

      {/* Nav items */}
      {filteredItems.length > 0 && (
        <div className="py-1.5 px-1.5 space-y-0.5">
          {filteredItems.map((item, i) => (
            <LinkTransition
              key={i}
              href={item.path}
              className="block w-full"
              callBack={() => { onClose(); closeMobile(); }}
            >
              <div className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150 cursor-pointer",
                item.highlight
                  ? "text-primary hover:bg-primary/[0.08]"
                  : "text-fg-secondary hover:bg-gray-100 dark:hover:bg-surface-hover"
              )}>
                {item.icon && (
                  <item.icon className={cn(
                    "h-4 w-4 shrink-0",
                    item.highlight ? "text-primary" : "text-fg-muted"
                  )} />
                )}
                {item.label}
              </div>
            </LinkTransition>
          ))}
        </div>
      )}

      {/* Divider + logout */}
      <div className="px-1.5 pb-1.5">
        {filteredItems.length > 0 && <div className="h-px bg-[var(--border)] mx-2 mb-1.5" />}
        <button
          onClick={() => { onLogout(); onClose(); }}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-150 cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};
