import { FC } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/utils/classNames";

export const Breadcrumbs: FC = () => {
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) return null;

  const labels: Record<string, string> = {
    workspaces: "Workspaces",
    settings: "Settings",
    profile: "Profile",
    security: "Security",
  };

  const getLabel = (path: string) => labels[path] || path.charAt(0).toUpperCase() + path.slice(1);

  return (
    <nav className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 overflow-hidden select-none">
      <Link
        to="/"
        className="flex items-center hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const label = getLabel(value);

        return (
          <div key={to} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 shrink-0" />
            <span
              className={cn(
                "truncate",
                last ? "text-gray-900 dark:text-white font-bold" : "cursor-default"
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </nav>
  );
};