import { FC, ReactNode, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/utils/classNames";

interface ModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | ReactNode;
  subtitle?: string;
  children: ReactNode;
  maxWidth?:
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "full";
  showCloseButton?: boolean;
  footer?: ReactNode;
  className?: string;
  zIndex?: number;
  variant?: "modal" | "drawer";
  drawerPlacement?: "right" | "bottom";
}

const maxWidthClasses = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  full: "max-w-full",
};

export const ModalLayout: FC<ModalLayoutProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "lg",
  showCloseButton = true,
  footer,
  className,
  zIndex = 100,
  variant = "modal",
  drawerPlacement = "right",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const isDrawer = variant === "drawer";

  // Animation lifecycle
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isOpen) {
      setShouldRender(true);
      timer = setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = "";
      }, 300);
    }

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (isVisible && e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isVisible, onClose]);

  // Scroll detection
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleScroll = () => {
      setIsHeaderSticky(el.scrollTop > 5);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [shouldRender]);

  if (!shouldRender) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Positioning and Animation classes
  const getContainerClasses = () => {
    if (isDrawer) {
      if (drawerPlacement === "right") {
        return cn(
          "fixed inset-0 flex justify-end overflow-hidden",
          isVisible ? "pointer-events-auto" : "pointer-events-none"
        );
      }
      return cn(
        "fixed inset-0 flex items-end justify-center overflow-hidden",
        isVisible ? "pointer-events-auto" : "pointer-events-none"
      );
    }
    return cn(
      "fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden",
      isVisible ? "pointer-events-auto" : "pointer-events-none"
    );
  };

  const getSurfaceClasses = () => {
    const base = "relative flex flex-col bg-white dark:bg-[#121212] shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) border-[var(--border)]";
    
    if (isDrawer) {
      if (drawerPlacement === "right") {
        return cn(
          base,
          "h-full w-full sm:w-[480px] border-l",
          isVisible ? "translate-x-0" : "translate-x-full"
        );
      }
      return cn(
        base,
        "w-full sm:max-w-2xl h-[85dvh] rounded-t-[2rem] border-t",
        isVisible ? "translate-y-0" : "translate-y-full"
      );
    }

    return cn(
      base,
      maxWidthClasses[maxWidth],
      "w-full rounded-t-[2rem] sm:rounded-[2rem] border",
      isVisible 
        ? "translate-y-0 opacity-100 scale-100" 
        : "translate-y-full sm:translate-y-12 opacity-0 sm:scale-[0.95]",
      "h-[92dvh] sm:h-auto sm:max-h-[85dvh]"
    );
  };

  return createPortal(
    <div className={getContainerClasses()} style={{ zIndex }}>
      {/* Premium Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-gray-900/20 transition-opacity duration-300 ease-out",
          isVisible ? "opacity-100 backdrop-blur-[2px]" : "opacity-0 backdrop-blur-none"
        )}
        onClick={handleBackdropClick}
      />

      {/* Modal/Drawer Surface */}
      <div className={cn(getSurfaceClasses(), className)} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header
          className={cn(
            "relative flex items-center justify-between px-8 py-6 transition-all duration-300 border-b",
            isHeaderSticky
              ? "bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border-[var(--border)] shadow-sm"
              : "bg-transparent border-transparent"
          )}
        >
          <div className="flex flex-col gap-1">
            <h2 id="modal-title" className="text-lg sm:text-xl font-heading text-gray-950 dark:text-white leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[13px] font-label text-gray-500">
                {subtitle}
              </p>
            )}
          </div>

          {showCloseButton && (
            <button
              onClick={onClose}
              className="group p-2.5 rounded-full border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-400 hover:text-gray-950 dark:hover:text-white transition-all active:scale-95 shadow-sm"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </header>

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar"
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <footer className="sticky bottom-0 mt-auto px-8 py-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-4 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl z-20">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
};
