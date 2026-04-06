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
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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

  // Scroll detection for header/footer depth
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

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden touch-none",
        isVisible ? "pointer-events-auto" : "pointer-events-none"
      )}
      style={{ zIndex }}
    >
      {/* Premium Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-gray-900/60 transition-opacity duration-300 ease-out touch-none",
          isVisible
            ? "opacity-100 backdrop-blur-md"
            : "opacity-0 backdrop-blur-none"
        )}
        onClick={handleBackdropClick}
      />

      {/* Modal Surface */}
      <div
        className={cn(
          "relative w-full flex flex-col bg-white dark:bg-gray-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) overflow-hidden",
          maxWidthClasses[maxWidth],
          // Mobile: slide up from bottom | Desktop: scale and fade
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-full sm:translate-y-12 opacity-0 sm:scale-[0.98]",
          "rounded-t-3xl sm:rounded-3xl",
          "h-[92dvh] sm:h-auto sm:max-h-[85dvh]",
          "border border-white/20 dark:border-gray-800",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header
          className={cn(
            "relative flex items-center justify-between px-4 sm:px-8 pt-7 pb-5 sm:pt-8 sm:pb-6 transition-all duration-300",
            isHeaderSticky
              ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)]"
              : "bg-transparent border-b border-transparent"
          )}
        >
          <div className="flex flex-col gap-0.5">
            <h2
              id="modal-title"
              className="text-[1.3rem] sm:text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide leading-none pt-1 pl-1">
                {subtitle}
              </p>
            )}
          </div>

          {showCloseButton && (
            <button
              onClick={onClose}
              className="group p-2.5 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-all active:scale-90"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5 transition-transform" />
            </button>
          )}
        </header>

        {/* Scrollable Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-3 sm:px-8 py-4 overscroll-contain custom-scrollbar scroll-smooth"
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <footer
            className={cn(
              "px-4 sm:px-8 py-4 sm:py-6 bg-gray-50/50 dark:bg-gray-950/20 border-t border-gray-100 dark:border-gray-800 transition-all",
              "flex items-center justify-end gap-3"
            )}
          >
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
};
