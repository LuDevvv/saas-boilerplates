import { Button } from "@node-stack/ui";
import { LucideIcon } from "lucide-react";
import { FC } from "react";

import { cn } from "@/lib/utils";


interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
      )}
      
      <h3 className="text-sm font-semibold text-fg">
        {title}
      </h3>
      
      {description && (
        <p className="mt-1 text-sm text-fg-secondary max-w-sm">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};