import React from "react";
import { AppStateProvider } from "../../providers/AppStateProvider";
import { Toaster } from "sonner";

/**
 * Logic-only wrapper for the dashboard environment.
 * Provides application state hydration and global notifications.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      {children}
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            background: "hsl(var(--background)/0.8)",
            backdropFilter: "blur(12px)",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border)/0.5)",
            borderRadius: "1.25rem",
            boxShadow:
              "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          },
          className: "font-bold text-sm",
        }}
      />
    </AppStateProvider>
  );
}
