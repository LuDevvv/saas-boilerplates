import { Moon, Sun } from "lucide-react";
import { FC } from "react";
import { flushSync } from "react-dom";

import { useThemeStore } from "@/stores/themeStore";


export const ThemeToggle: FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  const handleToggle = () => {
    if (!document.startViewTransition) {
      toggleTheme();
      return;
    }

    document.documentElement.classList.add('theme-toggling');
    
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        toggleTheme();
      });
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove('theme-toggling');
    });
  };

  return (
    <button
      onClick={handleToggle}
      className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-50/50 text-gray-500 transition-all duration-300 hover:bg-gray-100 hover:text-primary active:scale-95 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary border border-transparent hover:border-sidebar-border"
      aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </button>
  );
};
