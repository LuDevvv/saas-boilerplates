import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, install } = usePWAInstall();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!isInstallable) return;

    const timer = setTimeout(() => {
      const isDismissed = sessionStorage.getItem("pwa-prompt-dismissed");
      if (!isDismissed) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isInstallable]);

  const handleInstallClick = async () => {
    await install();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  // Don't show if already dismissed in this session
  if (sessionStorage.getItem("pwa-prompt-dismissed")) {
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-5 duration-300 lg:left-auto lg:right-6 lg:bottom-6 lg:max-w-sm">
      <div className="rounded-[1.25rem] border border-gray-100 bg-white p-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:border-gray-800 dark:bg-gray-900 lg:p-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100/50 dark:bg-blue-500/10 dark:border-blue-500/20 lg:h-11 lg:w-11">
            <Download
              className="h-5 w-5 text-blue-600 dark:text-blue-400"
              strokeWidth={2}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 tracking-tight dark:text-white truncate">
              Instalar Azteli
            </h3>
            <p className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 line-clamp-1 lg:mt-1 lg:text-xs">
              Acceso directo desde tu escritorio.
            </p>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={handleInstallClick}
              className="whitespace-nowrap rounded-xl bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-blue-700 active:scale-95 lg:px-4 lg:py-2 lg:text-xs"
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 rounded-xl p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
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
