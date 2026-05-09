import { useQueryClient } from "@tanstack/react-query";
import { WifiOff, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface ServiceWorkerRegistration {
  waiting?: ServiceWorker;
}

export const ConnectivityBanner = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      queryClient.resumePausedMutations();
    };
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [queryClient]);

  useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      import("virtual:pwa-register").then(({ registerSW }) => {
        registerSW({
          onNeedRefresh() {
            setShowUpdatePrompt(true);
          },
          onOfflineReady() {
            setShowUpdatePrompt(true);
          },
          onRegistered(r) {
            setRegistration(r as ServiceWorkerRegistration);
          },
        });
      }).catch(() => {});
    }
  }, []);

  const handleReload = useCallback(() => {
    if (registration) {
      registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  }, [registration]);

  if (!isOnline) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-500/95 text-white px-4 py-2 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto flex items-center justify-center gap-2 text-sm font-label">
          <WifiOff className="w-4 h-4" />
          <span>You are working offline. Changes will sync when connection is restored.</span>
        </div>
      </div>
    );
  }

  if (showUpdatePrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary/95 text-white px-4 py-2 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto flex items-center justify-center gap-4 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>A new version is available.</span>
          <button
            onClick={handleReload}
            className="font-label underline underline-offset-2 hover:no-underline"
          >
            Reload to update
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};