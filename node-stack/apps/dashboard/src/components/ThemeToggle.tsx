import { FC } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { flushSync } from "react-dom";

export const ThemeToggle: FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  const handleToggle = (e: React.MouseEvent) => {
    if (!document.startViewTransition) {
      toggleTheme();
      return;
    }

    const { clientX: x, clientY: y } = e;
    document.documentElement.style.setProperty('--x', `${x}px`);
    document.documentElement.style.setProperty('--y', `${y}px`);

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
      className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
      aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 animate-in fade-in zoom-in duration-300" />
      ) : (
        <Sun className="h-5 w-5 animate-in fade-in zoom-in duration-300" />
      )}
    </button>
  );
};
