import { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import { useSWUpdate } from "@/hooks/useSWUpdate";

export const UpdatePrompt: React.FC = () => {
  const { updateAvailable, updateApp } = useSWUpdate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!updateAvailable) return;

    const timer = setTimeout(() => {
      const isDismissed = sessionStorage.getItem("sw-update-dismissed");
      if (!isDismissed) {
        setShowPrompt(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [updateAvailable]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      updateApp();
    } catch (error) {
      console.error("Error updating app:", error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("sw-update-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-5 duration-300 lg:left-auto lg:right-6 lg:bottom-6 lg:max-w-sm">
      <div className="rounded-[1.25rem] border border-green-100 bg-green-50/95 backdrop-blur-sm p-3 shadow-lg dark:border-green-900/50 dark:bg-green-900/20 lg:p-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-green-100 border border-green-200/50 dark:bg-green-500/20 dark:border-green-500/30">
            <RefreshCw className="h-5 w-5 text-green-600 dark:text-green-400 animate-spin" strokeWidth={2} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-green-900 dark:text-green-100 tracking-tight">
              Nueva versión disponible
            </h3>
            <p className="mt-0.5 text-xs font-medium text-green-700/80 dark:text-green-300/80">
              Actualiza para obtener las últimas funciones
            </p>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="whitespace-nowrap rounded-xl bg-green-600 px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-green-700 active:scale-95 disabled:opacity-50 lg:px-4 lg:py-2 lg:text-xs"
            >
              {isUpdating ? "Actualizando..." : "Actualizar"}
            </button>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 rounded-xl p-1.5 text-green-600/70 transition-colors hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900/30 dark:hover:text-green-300"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
