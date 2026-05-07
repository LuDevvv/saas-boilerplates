import { useState, useEffect, useMemo } from "react";
import { Command } from "cmdk";
import {
  Search,
  Home,
  Settings,
  User,
  CreditCard,
  BarChart3,
  FileText,
  Layers,
  Building2,
  Globe,
  ShieldCheck,
  Command as CommandIcon,
  CornerDownLeft,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/stores/useAuth";
import { useSidebarStore } from "@/stores/sidebarStore";
import { cn } from "@/utils/classNames";
import { ModalLayout } from "@/layouts/ModalLayout";

export const CommandPalette = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, toggleCommandPalette } = useSidebarStore();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("todos");

  // ⌘+K / Ctrl+K — Escape handled by ModalLayout
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [toggleCommandPalette]);

  const close = () => setCommandPaletteOpen(false);

  const menuItems = useMemo(() => [
    {
      group: "Navegación",
      category: "paginas",
      items: [
        { icon: Home,     label: "Ir al Tablero",    shortcut: "D", action: () => navigate("/") },
        { icon: BarChart3, label: "Ver Analíticas",  shortcut: "A", action: () => navigate("/analytics") },
        { icon: Globe,    label: "Catálogo Público", shortcut: "P", action: () => window.open("https://azteli.com", "_blank") },
      ],
    },
    {
      group: "Cuenta y Seguridad",
      category: "personas",
      items: [
        { icon: User,      label: "Perfil Personal",     metadata: user?.email,                    action: () => navigate("/profile/personal") },
        { icon: Building2, label: "Ajustes de Empresa",  metadata: "Gestiona tu organización",     action: () => navigate("/profile/company") },
        { icon: ShieldCheck, label: "Seguridad y Llaves", shortcut: "S",                            action: () => navigate("/settings/security") },
      ],
    },
    {
      group: "Facturación",
      category: "documentos",
      items: [
        { icon: Layers,     label: "Plan de Suscripción",   metadata: "Plan Pro",        action: () => navigate("/payments") },
        { icon: FileText,   label: "Historial de Facturas", action: () => navigate("/payments/history") },
        { icon: CreditCard, label: "Métodos de Pago",       action: () => navigate("/payments/methods") },
      ],
    },
    {
      group: "Sistema",
      category: "todos",
      items: [
        { icon: Settings, label: "Preferencias",  shortcut: ",", action: () => navigate("/settings") },
        { icon: LogOut,   label: "Cerrar Sesión", shortcut: "L", action: () => logout(), variant: "danger" },
      ],
    },
  ], [navigate, logout, user]);

  const filters = [
    { id: "todos",      label: "Todos" },
    { id: "paginas",    label: "Páginas" },
    { id: "personas",   label: "Personas" },
    { id: "documentos", label: "Documentos" },
  ];

  const filteredGroups = useMemo(() =>
    activeFilter === "todos"
      ? menuItems
      : menuItems.filter((g) => g.category === activeFilter),
    [activeFilter, menuItems]
  );

  return (
    <ModalLayout
      isOpen={isCommandPaletteOpen}
      onClose={close}
      variant="command"
      size="2xl"
      showCloseButton={false}
      contentClassName="overflow-hidden"
      zIndex={150}
    >
      <Command className="flex flex-col overflow-hidden bg-transparent">
        {/* Search input */}
        <div className="flex flex-col border-b border-border">
          <div className="flex items-center gap-3 px-5 py-4">
            <Search className="h-5 w-5 text-gray-400 shrink-0" />
            <Command.Input
              placeholder="¿Qué estás buscando?"
              className="flex-1 bg-transparent text-[16px] text-fg outline-none placeholder:text-gray-400"
              autoFocus
            />
            <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-surface-muted text-[10px] font-mono text-gray-400">
              Esc
            </kbd>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 px-5 pb-3">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-medium transition-all border outline-none focus:outline-none active:scale-95",
                  activeFilter === filter.id
                    ? "bg-primary text-white border-primary"
                    : "bg-surface-hover text-gray-500 border-transparent hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <Command.List className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
          <Command.Empty className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-10 w-10 rounded-xl bg-surface-hover flex items-center justify-center mb-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-[13px] font-medium text-fg-secondary">Sin resultados</p>
            <p className="text-[11px] text-gray-400 mt-1">Intenta buscar algo más</p>
          </Command.Empty>

          {filteredGroups.map((group) => (
            <Command.Group
              key={group.group}
              heading={group.group}
              className="px-1 pt-2 pb-1"
            >
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => (
                  <Command.Item
                    key={item.label}
                    onSelect={() => { item.action(); close(); }}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl p-2.5 transition-colors cursor-pointer outline-none border border-transparent",
                      "aria-selected:bg-gray-100 dark:aria-selected:bg-white/5 aria-selected:border-[var(--border)]",
                      item.variant === "danger" && "aria-selected:bg-red-50 dark:aria-selected:bg-red-950/20"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-surface-hover transition-colors",
                      item.variant === "danger"
                        ? "group-aria-selected:bg-red-100 dark:group-aria-selected:bg-red-950/30 group-aria-selected:text-red-500"
                        : "group-aria-selected:bg-primary/10 group-aria-selected:text-primary"
                    )}>
                      <item.icon className="h-4 w-4 text-gray-500 group-aria-selected:text-inherit" />
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <span className={cn(
                        "text-[13px] font-medium text-gray-700 dark:text-gray-200",
                        item.variant === "danger" && "group-aria-selected:text-red-600 dark:group-aria-selected:text-red-400"
                      )}>
                        {item.label}
                      </span>
                      {item.metadata && (
                        <span className="text-[11px] text-gray-400 truncate">{item.metadata}</span>
                      )}
                    </div>

                    {item.shortcut && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-surface-muted">
                        <CommandIcon className="h-2.5 w-2.5 text-gray-400" />
                        <span className="text-[9px] font-mono text-gray-400">{item.shortcut}</span>
                      </div>
                    )}
                  </Command.Item>
                ))}
              </div>
            </Command.Group>
          ))}
        </Command.List>

        {/* Footer hints */}
        <div className="flex items-center gap-6 border-t border-border px-5 py-3 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <kbd className="flex h-5 w-5 items-center justify-center rounded border border-border bg-white dark:bg-white/5 shadow-sm">
              <CornerDownLeft className="h-3 w-3 text-gray-400" />
            </kbd>
            <span className="text-[10px] text-gray-400">Ejecutar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {["↑", "↓"].map((k) => (
                <kbd key={k} className="flex h-5 w-5 items-center justify-center rounded border border-border bg-white dark:bg-white/5 shadow-sm text-[10px] font-mono text-gray-400">
                  {k}
                </kbd>
              ))}
            </div>
            <span className="text-[10px] text-gray-400">Navegar</span>
          </div>
        </div>
      </Command>
    </ModalLayout>
  );
};
