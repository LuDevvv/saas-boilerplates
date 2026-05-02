import { FC } from "react";
import {
  Filter,
  MoreVertical,
  Shield,
  UserX,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/utils/classNames";
import { type AdminUser } from "@/features/admin";
import { UserSearch } from "./UserSearch";
import { UserTable } from "./UserTable";
import { UserRow } from "./UserRow";
import { UserEmptyState } from "./UserEmptyState";

interface UserTableContentProps {
  users: AdminUser[];
  onSuspend: (userId: string) => void;
  onBan: (userId: string) => void;
  onPromote: (userId: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const UserTableContent: FC<UserTableContentProps> = ({
  users,
  onSuspend,
  onBan,
  onPromote,
  searchTerm,
  onSearchChange
}) => {
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (users.length === 0) {
    return <UserEmptyState />;
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-white/5 dark:bg-gray-900 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row gap-4">
        <UserSearch value={searchTerm} onChange={onSearchChange} />
        <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-100 px-4 py-2 text-sm font-heading text-gray-600 hover:bg-gray-50 dark:border-white/5 dark:text-gray-400 dark:hover:bg-white/10 transition-colors">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      <UserTable>
        {filteredUsers.map((user) => (
          <UserRow key={user.id}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-heading text-white shadow-sm transition-transform group-hover:scale-105">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-heading text-gray-950 dark:text-white">{user.name}</div>
                  <div className="text-xs text-gray-500 lowercase">{user.email}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1.5">
                <Shield className={cn(
                  "h-3.5 w-3.5",
                  user.role === "admin" || user.role === "super_admin" ? "text-amber-500" : "text-gray-400"
                )} />
                <span className="text-sm font-label text-gray-700 dark:text-gray-300">
                  {user.role}
                </span>
              </div>
            </td>
            <td className="px-6 py-4">
              <span className={cn(
                "inline-flex items-center rounded-xl px-2.5 py-1 text-xs font-label",
                user.status === "Active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" :
                  user.status === "Pending" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" :
                    "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              )}>
                {user.status}
              </span>
            </td>
            <td className="px-6 py-4 text-sm font-label text-gray-500 dark:text-gray-400">
              {new Date(user.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => onPromote(user.id)}
                  className="px-2 py-1 text-xs font-label rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  Promote
                </button>
                <button
                  onClick={() => onSuspend(user.id)}
                  className="px-2 py-1 text-xs font-label rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-all"
                >
                  Suspend
                </button>
                <button
                  onClick={() => onBan(user.id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                >
                  <UserX className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-xl text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </td>
          </UserRow>
        ))}
      </UserTable>

      <div className="p-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
        <p className="text-sm font-label text-gray-500">
          Showing <span className="text-gray-950 dark:text-white font-heading">1 to {filteredUsers.length}</span> of {filteredUsers.length} users
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 dark:border-white/5 disabled:opacity-50 transition-colors" disabled>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 rounded-xl text-sm font-heading transition-all bg-blue-600 text-white shadow-md shadow-blue-500/20">
              1
            </button>
          </div>
          <button className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 dark:border-white/5 disabled:opacity-50 transition-colors" disabled>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};