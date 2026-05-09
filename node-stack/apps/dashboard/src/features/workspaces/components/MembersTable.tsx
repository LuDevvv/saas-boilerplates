import type { WorkspaceMember } from "@node-stack/types";
import {
  DataTable,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@node-stack/ui";
import { MoreHorizontal, Shield, UserMinus } from "lucide-react";
import { FC } from "react";

import { RoleBadge } from "./RoleBadge";


interface MembersTableProps {
  members: WorkspaceMember[];
  isLoading: boolean;
  onUpdateRole: (memberId: string, role: WorkspaceMember["role"]) => void;
  onRemove: (memberId: string) => void;
  currentUserId?: string;
}

export const MembersTable: FC<MembersTableProps> = ({
  members,
  isLoading,
  onUpdateRole,
  onRemove,
  currentUserId
}) => {
  const columns = [
    {
      accessorKey: "user",
      header: "Usuario",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cell: ({ row }: any) => {
        const member = row.original as WorkspaceMember;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const name = (member.user as any).name || "Usuario";
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={member.user.avatarUrl || undefined} />
              <AvatarFallback className="bg-primary-50 text-primary-700 text-xs font-heading">
                {name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-heading text-fg leading-none">
                {name}
                {member.userId === currentUserId && (
                  <span className="ml-2 text-[10px] bg-canvas px-1.5 py-0.5 rounded-md text-slate-500 uppercase font-label">Tú</span>
                )}
              </span>
              <span className="text-xs text-slate-400 font-label mt-1">{member.user.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Rol",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cell: ({ row }: any) => <RoleBadge role={row.original.role} />,
    },
    {
      id: "actions",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cell: ({ row }: any) => {
        const member = row.original as WorkspaceMember;
        const isOwner = member.role === "owner";
        const isSelf = member.userId === currentUserId;

        if (isOwner || isSelf) return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem onClick={() => onUpdateRole(member.userId, member.role === "admin" ? "member" : "admin")}>
                <Shield className="mr-2 h-4 w-4" />
                <span>{member.role === "admin" ? "Degradar a Miembro" : "Hacer Administrador"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10"
                onClick={() => onRemove(member.userId)}
              >
                <UserMinus className="mr-2 h-4 w-4" />
                <span>Eliminar de la compañía</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="rounded-3xl border border-border bg-surface/95 overflow-hidden shadow-sm p-4">
      <DataTable
        columns={columns}
        data={members}
        isLoading={isLoading}
      />
    </div>
  );
};
