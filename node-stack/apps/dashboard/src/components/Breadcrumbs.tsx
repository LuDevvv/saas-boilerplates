import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbNameMap: Record<string, string> = {
    profile: "Profile",
    personal: "Personal",
    billing: "Billing",
    security: "Security",
    settings: "Settings",
    products: "Products",
    workspaces: "Workspaces",
    reports: "Reports",
    analytics: "Analytics",
    payments: "Payments",
    auth: "Authentication",
    "sign-in": "Sign In",
    "sign-up": "Sign Up",
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 overflow-x-auto whitespace-nowrap no-scrollbar">
      <Link
        to="/"
        className="flex items-center hover:text-primary-500 transition-colors"
      >
        <Home size={14} className="mr-1" />
      </Link>

      {pathnames.length > 0 && (
        <ChevronRight size={14} className="flex-shrink-0" />
      )}

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const displayName = breadcrumbNameMap[name] || name;

        return (
          <div key={name} className="flex items-center">
            {isLast ? (
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {displayName}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-primary-500 transition-colors"
              >
                {displayName}
              </Link>
            )}
            {!isLast && (
              <ChevronRight size={14} className="mx-2 flex-shrink-0" />
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
