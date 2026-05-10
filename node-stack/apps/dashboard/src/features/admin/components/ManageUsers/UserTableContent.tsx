import {
  Filter,
  UserX,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Shield,
} from "lucide-react";
import { FC } from "react";

import { UserEmptyState } from "./UserEmptyState";
import { UserRow } from "./UserRow";
import { UserSearch } from "./UserSearch";
import { UserTable } from "./UserTable";

import { type AdminUser } from "@/features/admin";
import { cn } from "@/utils/classNames";


interface UserTableContentProps {
  users: AdminUser[];
  onSuspend: (userId: string) => void;
  onBan: (userId: string) => void;
  onPromote: (userId: string) => void;
  onImpersonate: (userId: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const UserTableContent: FC<UserTableContentProps> = ({
  users,
  onSuspend,
  onBan,
  onPromote,
  onImpersonate,
  searchTerm,
  onSearchChange,
}) => {
  const filteredUsers = users.filter(
    (user) =>
      (user.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (users.length === 0) {
    return <UserEmptyState />;
  }

  return (
    <div className="rounded-[20px] border border-border bg-surface shadow-[var(--shadow-card)] overflow-hidden">
      <div className="p-6 border-b border-border-subtle flex flex-col sm:flex-row gap-4">
        <UserSearch value={searchTerm} onChange={onSearchChange} />
        <button className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-[13px] font-medium text-fg-secondary hover:bg-surface-hover hover:text-fg hover:border-border-strong transition-colors">
          <Filter className="h-4 w-4" />
          Filtros
        </button>
      </div>

      <UserTable>
        {filteredUsers.map((user) => (
          <UserRow key={user.id}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center font-heading text-primary transition-transform group-hover:scale-105">
                  {(user.name ?? user.email).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-heading text-fg truncate">{user.name ?? user.email}</div>
                  <div className="text-xs text-fg-muted lowercase truncate">{user.email}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1.5">
                <Shield
                  className={cn(
                    "h-3.5 w-3.5",
                    user.role === "admin" || user.role === "super_admin"
                      ? "text-amber-500"
                      : "text-fg-muted"
                  )}
                />
                <span className="text-sm font-label text-fg-secondary">{user.role}</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase border",
                  user.status === "active"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : user.status === "suspended"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    user.status === "active"
                      ? "bg-emerald-500"
                      : user.status === "suspended"
                      ? "bg-amber-500"
                      : "bg-red-500"
                  )}
                />
                {user.status === "active" ? "Activo" : user.status === "suspended" ? "Suspendido" : "Baneado"}
              </span>
            </td>
            <td className="px-6 py-4 text-sm font-label text-fg-secondary">
              {new Date(user.createdAt).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => onPromote(user.id)}
                  className="px-2 py-1 text-[11px] font-medium rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15 opacity-0 group-hover:opacity-100 transition-all"
                >
                  Promover
                </button>
                <button
                  onClick={() => onSuspend(user.id)}
                  className="px-2 py-1 text-[11px] font-medium rounded-md bg-surface-hover text-fg-secondary hover:bg-surface-elevated hover:text-fg opacity-0 group-hover:opacity-100 transition-all"
                >
                  Suspender
                </button>
                <button
                  onClick={() => onImpersonate(user.id)}
                  className="px-2 py-1 text-[11px] font-medium rounded-md bg-surface-hover text-fg-secondary hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
                  title="Impersonar usuario"
                >
                  <LogIn className="h-3 w-3" />
                  Impersonar
                </button>
                <button
                  onClick={() => onBan(user.id)}
                  className="p-2 rounded-xl text-fg-muted hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                  title="Banear usuario"
                >
                  <UserX className="h-4 w-4" />
                </button>
              </div>
            </td>
          </UserRow>
        ))}
      </UserTable>

      <div className="p-6 border-t border-border-subtle flex items-center justify-between">
        <p className="text-sm font-label text-fg-muted">
          Mostrando <span className="text-fg font-heading">1 – {filteredUsers.length}</span> de{" "}
          {filteredUsers.length} usuarios
        </p>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-xl border border-border text-fg-muted hover:bg-surface-hover hover:text-fg disabled:opacity-50 transition-colors"
            disabled
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 rounded-xl text-sm font-heading transition-all bg-primary text-primary-foreground">
              1
            </button>
          </div>
          <button
            className="p-2 rounded-xl border border-border text-fg-muted hover:bg-surface-hover hover:text-fg disabled:opacity-50 transition-colors"
            disabled
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
