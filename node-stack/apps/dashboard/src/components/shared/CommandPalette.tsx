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
  X,
  Globe,
  ShieldCheck,
  Command as CommandIcon,
  CornerDownLeft,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/stores/useAuth";
import { useSidebarStore } from "@/stores/sidebarStore";
import { cn } from "@/utils/classNames";

export const CommandPalette = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, toggleCommandPalette } = useSidebarStore();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('todos');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandPalette();
      }
      
      if (e.key === "Escape" && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleCommandPalette, isCommandPaletteOpen, setCommandPaletteOpen]);

  const menuItems = useMemo(() => [
    {
      group: "Navegación",
      category: "paginas",
      items: [
        { icon: Home, label: "Ir al Tablero", shortcut: "D", action: () => navigate("/") },
        { icon: BarChart3, label: "Ver Analíticas", shortcut: "A", action: () => navigate("/analytics") },
        { icon: Globe, label: "Catálogo Público", shortcut: "P", action: () => window.open('https://azteli.com', '_blank') },
      ]
    },
    {
      group: "Cuenta y Seguridad",
      category: "personas",
      items: [
        { icon: User, label: "Perfil Personal", metadata: user?.email, action: () => navigate("/profile/personal") },
        { icon: Building2, label: "Ajustes de Empresa", metadata: "Gestiona tu organización", action: () => navigate("/profile/company") },
        { icon: ShieldCheck, label: "Seguridad y Llaves", shortcut: "S", action: () => navigate("/settings/security") },
      ]
    },
    {
      group: "Facturación",
      category: "documentos",
      items: [
        { icon: Layers, label: "Plan de Suscripción", metadata: "Plan Pro", action: () => navigate("/payments/current-plan") },
        { icon: FileText, label: "Historial de Facturas", action: () => navigate("/payments/history") },
        { icon: CreditCard, label: "Métodos de Pago", action: () => navigate("/payments/methods") },
      ]
    },
    {
      group: "Sistema",
      category: "todos",
      items: [
        { icon: Settings, label: "Preferencias Globales", shortcut: ",", action: () => navigate("/settings") },
        { icon: LogOut, label: "Cerrar Sesión", shortcut: "L", action: () => logout(), variant: "danger" },
      ]
    }
  ], [navigate, logout, user]);

  const filteredGroups = useMemo(() => {
    if (activeFilter === 'todos') return menuItems;
    return menuItems.filter(group => group.category === activeFilter);
  }, [activeFilter, menuItems]);

  if (!isCommandPaletteOpen) return null;

  const filters = [
    { id: 'todos', label: 'Todos' },
    { id: 'paginas', label: 'Páginas' },
    { id: 'personas', label: 'Personas' },
    { id: 'documentos', label: 'Documentos' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] p-4">
      <div 
        className="fixed inset-0 bg-gray-950/20 transition-opacity animate-fade-in" 
        onClick={() => setCommandPaletteOpen(false)}
      />

      <Command 
        className="relative w-full max-w-2xl overflow-hidden rounded-[20px] border border-sidebar-border bg-surface shadow-premium dark:bg-surface-dark animate-scale-in"
      >
        <div className="flex flex-col border-b border-sidebar-border">
          <div className="flex items-center px-6 py-4 gap-4">
            <Search className="h-5 w-5 text-sidebar-text opacity-50" />
            <Command.Input 
              placeholder="¿Qué estás buscando?"
              className="flex-1 bg-transparent text-[17px] font-label text-text-primary outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 placeholder:text-sidebar-text/40"
              autoFocus
            />
            <button 
                onClick={() => setCommandPaletteOpen(false)}
                className="p-1.5 rounded-lg hover:bg-sidebar-active text-sidebar-text transition-colors outline-none focus:outline-none focus:ring-0 active:scale-95"
            >
                <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-6 pb-4">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[11px] font-label transition-colors border outline-none focus:outline-none focus:ring-0 active:scale-95",
                  activeFilter === filter.id
                    ? "bg-primary text-white border-primary"
                    : "bg-sidebar-active text-sidebar-text border-sidebar-border hover:bg-sidebar-active hover:text-sidebar-text-active"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <Command.List className="max-h-[480px] overflow-y-auto p-2 custom-scrollbar">
          <Command.Empty className="flex flex-col items-center justify-center py-12 text-center">
             <div className="h-10 w-10 rounded-xl bg-sidebar-active flex items-center justify-center mb-3">
                <Search className="h-5 w-5 text-primary opacity-50" />
             </div>
             <p className="text-[13px] font-heading text-sidebar-text">No se encontraron resultados</p>
             <p className="text-[11px] text-sidebar-text/60 mt-1">Intenta buscar algo más</p>
          </Command.Empty>

          {filteredGroups.map((group) => (
            <Command.Group 
                key={group.group} 
                heading={group.group}
                className="px-2 pt-2 pb-1"
            >
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => (
                  <Command.Item
                    key={item.label}
                    onSelect={() => {
                        item.action();
                        setCommandPaletteOpen(false);
                    }}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg p-2 transition-colors cursor-pointer outline-none border border-transparent",
                      "aria-selected:bg-sidebar-active aria-selected:border-sidebar-border/50",
                      item.variant === 'danger' && "hover:bg-red-50 dark:hover:bg-red-950/20"
                    )}
                  >
                    <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center transition-colors bg-sidebar-active text-sidebar-text group-aria-selected:text-primary"
                    )}>
                        <item.icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[13px] font-heading text-sidebar-text-active">{item.label}</span>
                        {item.metadata && (
                            <span className="text-[10px] text-sidebar-text opacity-70 mt-1 truncate">
                                {item.metadata}
                            </span>
                        )}
                    </div>

                    {item.shortcut && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-sidebar-active border border-sidebar-border">
                            <CommandIcon className="h-2.5 w-2.5 text-sidebar-text/50" />
                            <span className="text-[9px] font-label text-sidebar-text/60">
                                {item.shortcut}
                            </span>
                        </div>
                    )}
                  </Command.Item>
                ))}
              </div>
            </Command.Group>
          ))}
        </Command.List>
        
        <div className="flex items-center justify-between border-t border-sidebar-border bg-sidebar px-6 py-4">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-sidebar-active border border-sidebar-border shadow-sm">
                        <CornerDownLeft className="h-3 w-3 text-sidebar-text" />
                    </div>
                    <span className="text-[10px] font-label text-sidebar-text">Ejecutar</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-sidebar-active border border-sidebar-border shadow-sm font-mono text-[10px] font-label text-sidebar-text">↑</div>
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-sidebar-active border border-sidebar-border shadow-sm font-mono text-[10px] font-label text-sidebar-text">↓</div>
                    </div>
                    <span className="text-[10px] font-label text-sidebar-text">Navegar</span>
                </div>
            </div>
        </div>
      </Command>
    </div>
  );
};
