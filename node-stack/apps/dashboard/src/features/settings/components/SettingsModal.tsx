import {
  X,
  User,
  Building2,
  Users,
  Key,
  Webhook,
  CreditCard,
  Crown,
  Palette,
  ChevronRight,
  Settings,
  ArrowLeft,
  Moon,
  Sun,
} from "lucide-react";
import { FC, useState, useEffect } from "react";
import { flushSync , createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import { useThemeStore } from "@/stores/themeStore";
import { cn } from "@/utils/classNames";

// ─── Section definitions ────────────────────────────────────────────────────

type SettingItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  description?: string;
  path?: string;
};

type SettingSection = {
  id: string;
  label: string;
  icon: React.ElementType;
  items: SettingItem[];
};

const SECTIONS: SettingSection[] = [
  {
    id: "general",
    label: "General",
    icon: Settings,
    items: [
      { id: "appearance", label: "Apariencia", icon: Palette, description: "Tema e interfaz visual" },
    ],
  },
  {
    id: "cuenta",
    label: "Cuenta",
    icon: User,
    items: [
      { id: "perfil", label: "Perfil personal", icon: User, description: "Tu información personal", path: "/profile/personal" },
      { id: "empresa", label: "Empresa", icon: Building2, description: "Datos de tu organización", path: "/profile/company" },
    ],
  },
  {
    id: "compania",
    label: "Compañía",
    icon: Building2,
    items: [
      { id: "equipo", label: "Equipo", icon: Users, description: "Miembros y roles", path: "/settings/members" },
      { id: "api-keys", label: "Claves API", icon: Key, description: "Tokens de acceso programático", path: "/settings/api-keys" },
      { id: "webhooks", label: "Webhooks", icon: Webhook, description: "Notificaciones a sistemas externos", path: "/settings/webhooks" },
    ],
  },
  {
    id: "facturacion",
    label: "Facturación",
    icon: CreditCard,
    items: [
      { id: "suscripcion", label: "Suscripción", icon: CreditCard, description: "Tu plan activo y pagos", path: "/payments" },
      { id: "planes", label: "Planes", icon: Crown, description: "Compara planes y funcionalidades", path: "/pricing" },
    ],
  },
];

const ALL_ITEMS = SECTIONS.flatMap((s) => s.items);

// ─── Theme card ───────────────────────────────────────────────────────────────

const THEME_OPTIONS = [
  { id: "light" as const, label: "Claro", icon: Sun },
  { id: "dark" as const, label: "Oscuro", icon: Moon },
];

const ThemeCard: FC<{
  id: "light" | "dark";
  label: string;
  icon: React.ElementType;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}> = ({ id, label, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "group flex flex-col rounded-[14px] border overflow-hidden transition-all duration-200 text-left",
      isSelected
        ? "border-primary/50 ring-2 ring-primary/15 ring-offset-1"
        : "border-[var(--border)] hover:border-border-strong"
    )}
  >
    {/* UI mockup preview */}
    <div className={cn(
      "relative w-full h-[72px] shrink-0",
      id === "light" ? "bg-[#F8FAFC]" : "bg-[#0A0A0A]"
    )}>
      {/* Browser chrome dots */}
      <div className="flex gap-[5px] px-2.5 pt-2.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-[5px] w-[5px] rounded-full",
              id === "dark" ? "bg-white/20" : "bg-gray-300"
            )}
          />
        ))}
      </div>
      {/* Sidebar + content mockup */}
      <div className="flex gap-1.5 px-2.5 pt-1.5">
        <div className={cn(
          "h-8 w-4 rounded-[3px] shrink-0",
          id === "dark" ? "bg-white/10" : "bg-gray-200"
        )} />
        <div className="flex-1 space-y-1">
          <div className={cn("h-2 w-full rounded-full", id === "dark" ? "bg-white/10" : "bg-gray-200")} />
          <div className={cn("h-1.5 w-3/4 rounded-full", id === "dark" ? "bg-white/[0.06]" : "bg-gray-150")} />
          <div className={cn("h-1.5 w-1/2 rounded-full", id === "dark" ? "bg-white/[0.06]" : "bg-gray-100")} />
        </div>
      </div>
    </div>

    {/* Label + radio — always light background for readability */}
    <div className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 bg-white">
      <div className={cn(
        "h-3.5 w-3.5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors",
        isSelected ? "border-primary" : "border-gray-300 dark:border-gray-600"
      )}>
        {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
      </div>
      <span className={cn(
        "text-[12px] font-medium transition-colors",
        isSelected ? "text-primary" : "text-fg-secondary"
      )}>
        {label}
      </span>
    </div>
  </button>
);

// ─── Appearance section ───────────────────────────────────────────────────────

const AppearanceContent: FC = () => {
  const { theme, setTheme } = useThemeStore();

  const handleThemeChange = (value: "light" | "dark", e: React.MouseEvent) => {
    if (!document.startViewTransition) {
      setTheme(value);
      return;
    }
    const { clientX: x, clientY: y } = e;
    document.documentElement.style.setProperty("--x", `${x}px`);
    document.documentElement.style.setProperty("--y", `${y}px`);
    document.documentElement.classList.add("theme-toggling");
    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(value));
    });
    transition.finished.finally(() => {
      document.documentElement.classList.remove("theme-toggling");
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase  text-fg-muted mb-3">
          Tema de la interfaz
        </p>
        <div className="grid grid-cols-2 gap-3">
          {THEME_OPTIONS.map(({ id, label, icon }) => (
            <ThemeCard
              key={id}
              id={id}
              label={label}
              icon={icon}
              isSelected={theme === id}
              onClick={(e) => handleThemeChange(id, e)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Nav item ─────────────────────────────────────────────────────────────────

const NavItem: FC<{
  item: SettingItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-sm font-medium transition-all duration-150 group text-left",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-hover hover:text-gray-900 dark:hover:text-white"
    )}
  >
    <item.icon className={cn(
      "h-4 w-4 shrink-0 transition-colors",
      isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
    )} />
    <span className="flex-1 truncate">{item.label}</span>
    {item.path && (
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300 group-hover:text-gray-400" />
    )}
  </button>
);

// ─── Navigation card (for path-based items) ───────────────────────────────────

const NavigationCard: FC<{ item: SettingItem; onNavigate: () => void }> = ({ item, onNavigate }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
    <div className="h-12 w-12 rounded-[16px] bg-primary/10 flex items-center justify-center">
      <item.icon className="h-5 w-5 text-primary" />
    </div>
    <div>
      <p className="font-semibold text-fg">{item.label}</p>
      <p className="text-[13px] text-gray-400 mt-0.5">{item.description}</p>
    </div>
    <button
      onClick={onNavigate}
      className="flex items-center gap-2 px-5 py-2 rounded-[12px] bg-primary text-white text-sm font-bold hover:bg-primary-600 active:scale-95 transition-all"
    >
      Ir a {item.label}
      <ChevronRight className="h-4 w-4" />
    </button>
  </div>
);

// ─── Main modal ──────────────────────────────────────────────────────────────

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [activeItemId, setActiveItemId] = useState("appearance");
  const [mobileView, setMobileView] = useState<"list" | "content">("list");

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
        setMobileView("list");
      }, 350);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (mobileView === "content") setMobileView("list");
        else onClose();
      }
    };
    if (isVisible) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isVisible, mobileView, onClose]);

  if (!shouldRender) return null;

  const activeItem = ALL_ITEMS.find((i) => i.id === activeItemId);

  const handleItemClick = (item: SettingItem) => {
    if (item.path) {
      onClose();
      setTimeout(() => navigate(item.path!), 350);
    } else {
      setActiveItemId(item.id);
      setMobileView("content");
    }
  };

  const renderContent = () => {
    if (activeItemId === "appearance") return <AppearanceContent />;
    if (activeItem?.path) {
      return <NavigationCard item={activeItem} onNavigate={() => handleItemClick(activeItem)} />;
    }
    return null;
  };

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-6",
        isVisible ? "pointer-events-auto" : "pointer-events-none"
      )}
      style={{ zIndex: 200 }}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-gray-950/30 transition-all duration-300",
          isVisible ? "opacity-100 backdrop-blur-[2px]" : "opacity-0 backdrop-blur-none"
        )}
        onClick={onClose}
      />

      {/* Surface — fixed height so both panels share the same bottom edge */}
      <div
        className={cn(
          "relative z-10 flex overflow-hidden",
          "bg-surface-elevated",
          "border border-border",
          "shadow-[var(--shadow-elevated)]",
          "w-full sm:max-w-3xl",
          "rounded-t-[28px] sm:rounded-[28px]",
          "h-[92dvh] sm:h-[600px]",
          "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isVisible
            ? "translate-y-0 opacity-100 sm:scale-100"
            : "translate-y-full sm:translate-y-8 opacity-0 sm:scale-[0.97]"
        )}
      >
        {/* ── Left nav panel (desktop only) ─────────────────────────── */}
        <aside className="hidden sm:flex flex-col w-[240px] shrink-0 border-r border-border bg-surface-muted">
          {/* Left header — py-6 must match right header */}
          <div className="px-6 py-6 border-b border-border">
            <h2 className="text-lg font-bold text-fg leading-none">
              Configuración
            </h2>
          </div>

          <nav className="flex-1 p-2 space-y-3 overflow-y-auto custom-scrollbar">
            {SECTIONS.map((section) => (
              <div key={section.id}>
                {/* Section label — bigger icon + bigger text */}
                <div className="flex items-center gap-2 px-3 py-1 mb-0.5">
                  <section.icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="text-[11px] font-bold uppercase  text-fg-muted">
                    {section.label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <NavItem
                      key={item.id}
                      item={item}
                      isActive={activeItemId === item.id && !item.path}
                      onClick={() => handleItemClick(item)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* ── Right content panel ────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Right header — py-6 must match left header so border-b lines align */}
          <header className="flex items-center justify-between px-6 sm:px-8 py-6 border-b border-border shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {mobileView === "content" && (
                <button
                  onClick={() => setMobileView("list")}
                  className="sm:hidden flex items-center justify-center h-8 w-8 rounded-full hover:bg-surface-hover text-fg-muted transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-fg leading-none truncate">
                  {activeItem?.label ?? "Configuración"}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 rounded-full border border-border hover:bg-surface-hover text-fg-muted hover:text-fg transition-all active:scale-95 ml-4"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Mobile: nav list */}
            <div className={cn("sm:hidden", mobileView === "content" && "hidden")}>
              <div className="p-4 space-y-4">
                {SECTIONS.map((section) => (
                  <div key={section.id}>
                    <div className="flex items-center gap-1.5 px-1 py-1 mb-1">
                      <section.icon className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-[11px] font-bold uppercase  text-gray-400">
                        {section.label}
                      </span>
                    </div>
                    <div className="rounded-[16px] border border-border overflow-hidden divide-y divide-border">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-hover transition-colors"
                        >
                          <div className="h-8 w-8 rounded-[10px] bg-surface-hover flex items-center justify-center shrink-0">
                            <item.icon className="h-4 w-4 text-fg-secondary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-fg truncate">{item.label}</p>
                            {item.description && (
                              <p className="text-[12px] text-gray-400 truncate">{item.description}</p>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop content / Mobile content view */}
            <div className={cn(
              "p-6 sm:p-8",
              "hidden sm:block",
              mobileView === "content" && "!block"
            )}>
              {activeItem?.description && (
                <p className="text-[13px] text-gray-400 mb-5">{activeItem.description}</p>
              )}
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
