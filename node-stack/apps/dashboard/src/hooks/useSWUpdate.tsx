import { useEffect, useState, createContext, useContext, ReactNode } from "react";

interface SWUpdateContextType {
  updateAvailable: boolean;
  updateApp: () => void;
  registration: ServiceWorkerRegistration | null;
}

const SWUpdateContext = createContext<SWUpdateContextType>({
  updateAvailable: false,
  updateApp: () => {},
  registration: null,
});

export const useSWUpdate = () => useContext(SWUpdateContext);

interface SWUpdateProviderProps {
  children: ReactNode;
}

export const SWUpdateProvider: React.FC<SWUpdateProviderProps> = ({ children }) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.ready.then((reg) => {
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              setRegistration(reg);
            }
          });
        }
      });

      if (reg.waiting) {
        setUpdateAvailable(true);
        setRegistration(reg);
      }
    });
  }, []);

  const updateApp = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  };

  return (
    <SWUpdateContext.Provider value={{ updateAvailable, updateApp, registration }}>
      {children}
    </SWUpdateContext.Provider>
  );
};
