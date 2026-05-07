import { FC } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@node-stack/ui";
import { MoreHorizontal, Shield, UserMinus } from "lucide-react";
import { RoleBadge } from "./RoleBadge";
import { cn } from "@/utils/classNames";
import type { WorkspaceMember } from "@node-stack/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MembersListProps {
  members: WorkspaceMember[];
  isLoading: boolean;
  onUpdateRole: (memberId: string, role: WorkspaceMember["role"]) => void;
  onRemove: (memberId: string) => void;
  currentUserId?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMemberName(user: any): string {
  if (user.firstName) {
    return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`.trim();
  }
  return user.name || user.email?.split("@")[0] || "Usuario";
}

function formatJoinDate(raw?: string): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "2-digit" });
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

const SkeletonRow: FC = () => (
  <div className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
    <div className="h-9 w-9 rounded-full bg-surface-hover shrink-0" />
    <div className="flex-1 space-y-2 min-w-0">
      <div className="h-3.5 w-32 rounded-full bg-surface-hover" />
      <div className="h-3 w-44 rounded-full bg-surface-hover" />
    </div>
    <div className="hidden sm:block h-5 w-20 rounded-full bg-surface-hover" />
    <div className="w-8 shrink-0" />
  </div>
);

// ─── Member row ───────────────────────────────────────────────────────────────

const MemberRow: FC<{
  member: WorkspaceMember;
  onUpdateRole: MembersListProps["onUpdateRole"];
  onRemove: MembersListProps["onRemove"];
  currentUserId?: string;
}> = ({ member, onUpdateRole, onRemove, currentUserId }) => {
  const user = member.user as any;
  const name = getMemberName(user);
  const initials = name.slice(0, 2).toUpperCase();
  const isOwner = member.role === "owner";
  const isSelf = member.userId === currentUserId;
  const joined = formatJoinDate((member as any).createdAt || (member as any).joinedAt);

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-hover transition-colors duration-150">
      {/* Avatar + info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-9 w-9 shrink-0 border border-border">
          <AvatarImage src={user.avatarUrl || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[14px] font-semibold text-fg leading-snug truncate">
              {name}
            </p>
            {isSelf && (
              <span className="shrink-0 text-[10px] font-bold uppercase text-gray-400 bg-surface-hover px-1.5 py-0.5 rounded-md">
                Tú
              </span>
            )}
          </div>
          <p className="text-[12px] text-fg-muted truncate">{user.email}</p>
          {/* Role badge on mobile — hidden on sm+ */}
          <div className="sm:hidden mt-1.5">
            <RoleBadge role={member.role} />
          </div>
        </div>
      </div>

      {/* Role — desktop only */}
      <div className="hidden sm:flex justify-center w-[120px] shrink-0">
        <RoleBadge role={member.role} />
      </div>

      {/* Join date — hidden on small tablets, visible on md+ */}
      <div className={cn("hidden md:block w-24 text-right shrink-0", !joined && "md:hidden")}>
        {joined && (
          <span className="text-[11px] text-fg-muted tabular-nums">
            {joined}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0 w-8 flex justify-end">
        {!isOwner && !isSelf ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all active:scale-90">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-[14px]">
              <DropdownMenuItem
                onClick={() => onUpdateRole(
                  member.userId,
                  member.role === "admin" ? "member" : "admin"
                )}
              >
                <Shield className="mr-2 h-4 w-4" />
                {member.role === "admin" ? "Degradar a Miembro" : "Hacer Administrador"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10"
                onClick={() => onRemove(member.userId)}
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Eliminar de la compañía
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="h-8 w-8" />
        )}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const MembersList: FC<MembersListProps> = ({
  members,
  isLoading,
  onUpdateRole,
  onRemove,
  currentUserId,
}) => {
  return (
    <div className="rounded-[20px] border border-border bg-white dark:bg-surface overflow-hidden">
      {/* Column header — desktop only */}
      <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 border-b border-border bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="flex-1 text-[11px] font-bold uppercase  text-gray-400">
          Miembro
        </div>
        <div className="w-[120px] text-center text-[11px] font-bold uppercase  text-gray-400">
          Rol
        </div>
        <div className="hidden md:block w-24 text-right text-[11px] font-bold uppercase  text-gray-400">
          Ingresó
        </div>
        <div className="w-8" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
          : members.map(m => (
            <MemberRow
              key={m.userId}
              member={m}
              onUpdateRole={onUpdateRole}
              onRemove={onRemove}
              currentUserId={currentUserId}
            />
          ))
        }
      </div>
    </div>
  );
};
