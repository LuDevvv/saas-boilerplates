import { useState, useMemo } from "react";
import { ChevronsUpDown, Check, Plus } from "lucide-react";
import { cn } from "@/utils/classNames";
import { AnimatePresence, motion } from "framer-motion";
import { useWorkspaces } from "@/features/workspaces/hooks/useWorkspaces";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useShallow } from "zustand/react/shallow";

interface WorkspaceSwitcherProps {
  isCollapsed: boolean;
}

export const WorkspaceSwitcher = ({ isCollapsed }: WorkspaceSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: workspaces = [] } = useWorkspaces();
  const activeWorkspaceId = useWorkspaceStore(useShallow((state) => state.activeWorkspaceId));
  const setActiveWorkspace = useWorkspaceStore(useShallow((state) => state.setActiveWorkspace));

  const selectedWorkspace = useMemo(() => 
    workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0],
    [workspaces, activeWorkspaceId]
  );

  if (!selectedWorkspace) return null;

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center border-b border-sidebar-border bg-transparent h-[68px] px-5 transition-all duration-300"
        )}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-[6px] outline-none focus:outline-none focus-visible:outline-none focus:ring-0 group transition-all duration-300 active:scale-95"
          )}
        >
          {/* Brand Logo - Standard Minimal version */}
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-primary p-2 transition-transform duration-300">
            {selectedWorkspace.logoUrl ? (
              <img src={selectedWorkspace.logoUrl} alt={selectedWorkspace.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="h-1 w-1 rounded-full bg-white" />
                  <div className="h-1 w-1 rounded-full bg-white/60" />
                  <div className="h-1 w-1 rounded-full bg-white/60" />
                  <div className="h-1 w-1 rounded-full bg-white" />
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="flex flex-col items-start animate-fade-in-fast">
              <div className="flex items-center gap-2">
                <span className="text-base font-heading text-gray-950 dark:text-white ">
                  {selectedWorkspace.name}
                </span>
                <ChevronsUpDown className="h-3.5 w-3.5 text-sidebar-text/40 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[10px] font-label text-sidebar-text/50 uppercase">
                {selectedWorkspace.status}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && !isCollapsed && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.96, filter: "blur(4px)" }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                transition: {
                  type: "spring",
                  stiffness: 350,
                  damping: 25,
                  mass: 0.8
                }
              }}
              exit={{
                opacity: 0,
                y: -8,
                scale: 0.96,
                filter: "blur(4px)",
                transition: { duration: 0.15, ease: "easeOut" }
              }}
              className="absolute left-4 right-4 top-[72px] z-50 overflow-hidden rounded-xl border border-sidebar-border bg-white dark:bg-[#121212] p-1.5 shadow-2xl outline-none"
            >
              <div className="px-3 py-2 text-[10px] font-label uppercase text-sidebar-text">
                Espacios de Trabajo
              </div>
              <div className="space-y-0.5">
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => {
                      setActiveWorkspace(workspace.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-200 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 active:scale-95",
                      activeWorkspaceId === workspace.id
                        ? "bg-sidebar-active text-sidebar-text-active font-heading"
                        : "text-sidebar-text hover:bg-sidebar-active/50 hover:text-sidebar-text-active"
                    )}
                  >
                    <div className="flex flex-col items-start">
                      <span>{workspace.name}</span>
                      <span className="text-[10px] font-label text-sidebar-text/70">
                        {workspace.status}
                      </span>
                    </div>
                    {activeWorkspaceId === workspace.id && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
              <div className="mt-1.5 border-t border-sidebar-border pt-1.5">
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-label text-sidebar-text hover:bg-sidebar-active/50 hover:text-sidebar-text-active outline-none focus:outline-none focus-visible:outline-none focus:ring-0 active:scale-95 transition-all duration-200">
                  <Plus className="h-4 w-4" />
                  Crear espacio
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
