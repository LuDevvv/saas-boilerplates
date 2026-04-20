import { useState } from "react";
import { create } from "zustand";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAStore {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstallable: boolean;
  setDeferredPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
}

const usePWAStore = create<PWAStore>((set) => ({
  deferredPrompt: null,
  isInstallable: false,
  setDeferredPrompt: (prompt) =>
    set({ deferredPrompt: prompt, isInstallable: !!prompt }),
}));

// Inicializar el listener globalmente para capturar el evento lo antes posible
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    usePWAStore.getState().setDeferredPrompt(e as BeforeInstallPromptEvent);
  });

  window.addEventListener("appinstalled", () => {
    usePWAStore.getState().setDeferredPrompt(null);
    sessionStorage.removeItem("pwa-prompt-dismissed");
  });
}

export const usePWAInstall = () => {
  const { deferredPrompt, isInstallable, setDeferredPrompt } = usePWAStore();
  const [isLoading, setIsLoading] = useState(false);

  const install = async () => {
    if (!deferredPrompt) return;

    setIsLoading(true);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error("Error installing PWA:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isInstallable, install, isLoading, deferredPrompt };
};
