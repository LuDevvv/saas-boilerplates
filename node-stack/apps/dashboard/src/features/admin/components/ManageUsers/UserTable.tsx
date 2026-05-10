import { FC, ReactNode } from "react";

interface UserTableProps {
  children: ReactNode;
}

export const UserTable: FC<UserTableProps> = ({ children }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface-muted border-b border-border-subtle">
            <th className="px-6 py-4 text-[10px] font-bold uppercase  text-fg-muted">User Details</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase  text-fg-muted">Role</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase  text-fg-muted">Status</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase  text-fg-muted">Joined</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase  text-fg-muted text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {children}
        </tbody>
      </table>
    </div>
  );
};
