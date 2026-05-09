import { X } from "lucide-react";
import { FC, ReactNode, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/utils/classNames";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ModalVariant =
  | "modal"          // Centered dialog — mobile becomes bottom sheet
  | "drawer-right"   // Slides from right — side panel / forms
  | "drawer-bottom"  // Slides from bottom — mobile-first actions
  | "command";       // Top-centered — search palettes, quick actions

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";

const SIZE_MAP: Record<ModalSize, string> = {
  sm:   "sm:max-w-sm",
  md:   "sm:max-w-md",
  lg:   "sm:max-w-lg",
  xl:   "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
  full: "sm:max-w-full",
};

export interface ModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  // Content
  title?: ReactNode;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  // Behaviour
  variant?: ModalVariant;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  // Styling
  className?: string;
  contentClassName?: string;
  // System
  zIndex?: number;
  // Legacy compat (ignored, kept to avoid breakage in existing usages)
  subtitle?: string;
  maxWidth?: string;
  drawerPlacement?: string;
}

// ─── Animation helpers ────────────────────────────────────────────────────────

const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const DURATION_IN = "400ms";
const COMMAND_DURATION = "200ms";

function getSurfaceClasses(variant: ModalVariant, size: ModalSize, isVisible: boolean): string {
  const base = cn(
    "relative z-10 flex flex-col",
    "bg-surface-elevated",
    "border border-border",
    "shadow-[var(--shadow-elevated)]",
    `transition-all ease-[${EASE_OUT}]`,
    isVisible ? "" : "pointer-events-none"
  );

  switch (variant) {
    case "modal":
      return cn(
        base,
        SIZE_MAP[size],
        "w-full",
        // Mobile: bottom sheet
        "rounded-t-[28px] sm:rounded-[28px]",
        "h-auto max-h-[92dvh] sm:max-h-[85dvh]",
        isVisible
          ? "translate-y-0 opacity-100 sm:scale-100"
          : "translate-y-full sm:translate-y-6 opacity-0 sm:scale-[0.97]"
      );

    case "drawer-right":
      return cn(
        base,
        "h-full w-full sm:max-w-[480px]",
        "sm:rounded-l-[24px]",
        isVisible ? "translate-x-0" : "translate-x-full"
      );

    case "drawer-bottom":
      return cn(
        base,
        SIZE_MAP[size] || "sm:max-w-2xl",
        "w-full",
        "rounded-t-[28px]",
        "max-h-[85dvh]",
        isVisible ? "translate-y-0" : "translate-y-full"
      );

    case "command":
      return cn(
        base,
        SIZE_MAP[size] || "sm:max-w-2xl",
        "w-full",
        "rounded-[20px]",
        "max-h-[70dvh]",
        isVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-[-10px] opacity-0 scale-[0.98]"
      );
  }
}

function getContainerClasses(variant: ModalVariant, isVisible: boolean): string {
  const base = cn(
    "fixed inset-0",
    isVisible ? "pointer-events-auto" : "pointer-events-none"
  );

  switch (variant) {
    case "modal":
      return cn(base, "flex items-end sm:items-center justify-center p-0 sm:p-6");
    case "drawer-right":
      return cn(base, "flex justify-end");
    case "drawer-bottom":
      return cn(base, "flex items-end justify-center");
    case "command":
      return cn(base, "flex items-start justify-center pt-[12vh] px-4");
  }
}

function getDuration(variant: ModalVariant): string {
  return variant === "command" ? COMMAND_DURATION : DURATION_IN;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ModalLayout: FC<ModalLayoutProps> = ({
  isOpen,
  onClose,
  title,
  description,
  subtitle,    // legacy
  children,
  footer,
  variant = "modal",
  size = "md",
  showCloseButton = true,
  closeOnBackdrop = true,
  className,
  contentClassName,
  zIndex = 100,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const desc = description ?? subtitle;
  const hasHeader = title != null;
  const duration = getDuration(variant);

  // — Lifecycle
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (isOpen) {
      setShouldRender(true);
      t = setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      t = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = "";
      }, 320);
    }
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => () => { document.body.style.overflow = ""; }, []);

  // — Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isVisible && e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isVisible, onClose]);

  // — Sticky header detection
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => setIsHeaderSticky(el.scrollTop > 4);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [shouldRender]);

  if (!shouldRender) return null;

  const backdropOpacity = variant === "command"
    ? isVisible ? "opacity-60" : "opacity-0"
    : isVisible ? "opacity-100" : "opacity-0";

  return createPortal(
    <div
      className={getContainerClasses(variant, isVisible)}
      style={{ zIndex }}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-gray-950/30 transition-opacity",
          variant === "command" && "bg-gray-950/20",
          backdropOpacity,
          isVisible ? "backdrop-blur-[2px]" : "backdrop-blur-none",
          `duration-[${duration}]`
        )}
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Surface */}
      <div
        className={cn(
          getSurfaceClasses(variant, size, isVisible),
          `duration-[${duration}]`,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        {hasHeader && (
          <header
            className={cn(
              "shrink-0 flex items-center justify-between px-6 py-5 transition-all duration-200 border-b",
              isHeaderSticky
                ? "bg-surface-elevated border-border shadow-[var(--shadow-sm)]"
                : "bg-transparent border-transparent"
            )}
          >
            <div className="min-w-0 flex-1">
              <h2 className="text-[17px] font-bold text-fg leading-snug truncate">
                {title}
              </h2>
              {desc && (
                <p className="text-[13px] text-fg-muted mt-0.5 truncate">{desc}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-4 shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-border text-fg-muted hover:bg-surface-hover hover:text-fg transition-all active:scale-95"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </header>
        )}

        {/* ── Content ── */}
        <div
          ref={contentRef}
          className={cn(
            "flex-1 overflow-y-auto custom-scrollbar",
            !hasHeader && "pt-5",
            contentClassName
          )}
        >
          {children}
        </div>

        {/* ── Footer ── */}
        {footer && (
          <footer className="shrink-0 px-6 py-4 border-t border-border bg-surface-elevated">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
};
