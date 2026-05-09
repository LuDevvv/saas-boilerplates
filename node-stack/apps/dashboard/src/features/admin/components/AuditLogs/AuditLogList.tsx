import { FC, ReactNode } from "react";

interface AuditLogListProps {
  children: ReactNode;
}

export const AuditLogList: FC<AuditLogListProps> = ({ children }) => {
  return <div className="divide-y divide-border-subtle">{children}</div>;
};
