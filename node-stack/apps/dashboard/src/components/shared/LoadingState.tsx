import { FC } from "react";

import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export const LoadingState: FC<LoadingStateProps> = ({
  message = "Cargando...",
  size = "md",
  className,
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-8 px-4",
      className
    )}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-border border-t-primary",
        sizeClasses[size]
      )} />
      {message && (
        <p className="mt-3 text-sm text-fg-secondary">
          {message}
        </p>
      )}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
}

export const Skeleton: FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={cn(
      "animate-pulse rounded-md bg-gray-200 dark:bg-white/10",
      className
    )} />
  );
};

interface CardSkeletonProps {
  rows?: number;
}

export const CardSkeleton: FC<CardSkeletonProps> = ({ rows = 3 }) => {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </div>
  );
};

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export const TableSkeleton: FC<TableSkeletonProps> = ({ columns, rows = 5 }) => {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};