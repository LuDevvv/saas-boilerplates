import { FC, useState, useEffect } from "react";
import { 
  Building2, 
  ChevronDown, 
  Check, 
  PlusCircle, 
  Settings 
} from "lucide-react";
import { cn } from "@/utils/classNames";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useAuth } from "@/hooks/stores/useAuth";

export const WorkspaceSwitcher: FC = () => {
  const { user } = useAuth();
  const { 
    workspaces, 
    activeWorkspace, 
    activeWorkspaceId, 
    fetchWorkspaces, 
    setActiveWorkspaceId,
    loading 
  } = useWorkspaceStore();
  
  const [isOpen, setIsOpen] = useState(false);

  // Fetch workspaces on load if authenticated
  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    }
  }, [user, fetchWorkspaces]);

  if (!user || workspaces.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium transition-all hover:bg-gray-50 active:scale-95 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900 cursor-pointer shadow-sm",
          isOpen && "ring-2 ring-indigo-500/20 border-indigo-500/50",
          loading && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          <Building2 className="h-4 w-4" />
        </div>
        <span className="max-w-[120px] truncate text-gray-700 dark:text-gray-200 font-bold tracking-tight">
          {activeWorkspace?.name || "Select Workspace"}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute left-0 top-full z-20 mt-2 w-72 origin-top-left rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-gray-800 dark:bg-gray-950 animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-2 px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">
                Switch Workspace
              </p>
            </div>
            
            <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    if (ws.id !== activeWorkspaceId) {
                      setActiveWorkspaceId(ws.id);
                    }
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-900 group cursor-pointer",
                    activeWorkspaceId === ws.id 
                      ? "bg-indigo-50/50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 font-bold" 
                      : "text-gray-600 dark:text-gray-400"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-all group-hover:border-indigo-200 dark:group-hover:border-indigo-900/50",
                      activeWorkspaceId === ws.id && "border-indigo-200 ring-2 ring-indigo-500/10 text-indigo-500"
                    )}>
                      {ws.logo ? (
                        <img src={ws.logo} alt={ws.name} className="h-full w-full object-cover rounded-xl" />
                      ) : (
                        <Building2 className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm truncate w-full">{ws.name}</span>
                      <span className="text-[10px] font-medium opacity-60 uppercase tracking-wider">{ws.role}</span>
                    </div>
                  </div>
                  {activeWorkspaceId === ws.id && (
                    <div className="bg-indigo-100 dark:bg-indigo-900/40 p-1 rounded-full shadow-sm">
                      <Check className="h-3 w-3 text-indigo-600 dark:text-indigo-400 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="my-2 border-t border-gray-100 dark:border-gray-800/60" />

            <div className="px-1 py-1">
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900 transition-colors cursor-pointer group">
                <PlusCircle className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                <span>New Workspace</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900 transition-colors cursor-pointer group">
                <Settings className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                <span>Workspace Settings</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
