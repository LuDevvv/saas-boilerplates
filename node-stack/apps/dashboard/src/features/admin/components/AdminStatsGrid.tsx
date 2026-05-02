import { FC, ReactNode } from "react";

interface AdminStatsGridProps {
  children: ReactNode;
}

export const AdminStatsGrid: FC<AdminStatsGridProps> = ({ children }) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
};