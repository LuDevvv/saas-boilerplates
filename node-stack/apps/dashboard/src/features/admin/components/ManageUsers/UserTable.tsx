import { FC, ReactNode } from "react";

interface UserTableProps {
  children: ReactNode;
}

export const UserTable: FC<UserTableProps> = ({ children }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
            <th className="px-6 py-4 text-xs font-label uppercase text-gray-400">User Details</th>
            <th className="px-6 py-4 text-xs font-label uppercase text-gray-400">Role</th>
            <th className="px-6 py-4 text-xs font-label uppercase text-gray-400">Status</th>
            <th className="px-6 py-4 text-xs font-label uppercase text-gray-400">Joined</th>
            <th className="px-6 py-4 text-xs font-label uppercase text-gray-400 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
          {children}
        </tbody>
      </table>
    </div>
  );
};