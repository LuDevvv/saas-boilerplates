import { FC, ReactNode } from "react";

interface AdminAuditLogsPageProps {
  children: ReactNode;
}

export const AdminAuditLogsPage: FC<AdminAuditLogsPageProps> = ({ children }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      {children}
    </div>
  );
};

interface AuditLogsPageProps {
  children: ReactNode;
}

export const AuditLogsPage: FC<AuditLogsPageProps> = ({ children }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      {children}
    </div>
  );
};