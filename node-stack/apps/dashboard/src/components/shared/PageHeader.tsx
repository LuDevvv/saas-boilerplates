import { FC, ReactNode } from "react";

import { Breadcrumbs } from "../layout/Breadcrumbs";

import { cn } from "@/utils/classNames";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  showBreadcrumbs?: boolean;
}

export const PageHeader: FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className,
  showBreadcrumbs = true,
}) => {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {showBreadcrumbs && (
        <div className="lg:hidden -mb-4">
          <Breadcrumbs />
        </div>
      )}
      
      <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4")}>
        <div>
          <h1 className="text-2xl font-heading text-fg">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-fg-secondary">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};