import { FC } from "react";
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
  Badge
} from "@node-stack/ui";
import { MoreHorizontal, Shield, UserMinus } from "lucide-react";
import { RoleBadge } from "./RoleBadge";
import { cn } from "@/utils/classNames";
import type { WorkspaceMember } from "../api/workspaces.api";

interface MembersTableProps {
  members: WorkspaceMember[];
  isLoading: boolean;
  onUpdateRole: (memberId: string, role: string) => void;
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
      cell: ({ row }: any) => {
        const member = row.original as WorkspaceMember;
        const name = member.user.name || `${member.user.firstName || ""} ${member.user.lastName || ""}`.trim() || "Usuario";
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-slate-100 dark:border-white/5">
              <AvatarImage src={member.user.avatarUrl || undefined} />
              <AvatarFallback className="bg-primary-50 text-primary-700 text-xs font-heading">
                {name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-heading text-slate-900 dark:text-white leading-none">
                {name}
                {member.userId === currentUserId && (
                  <span className="ml-2 text-[10px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md text-slate-500 uppercase font-label">Tú</span>
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
      cell: ({ row }: any) => <RoleBadge role={row.original.role} />,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }: any) => {
        const status = row.original.status;
        return (
          <Badge 
            variant="secondary" 
            className={cn(
              "text-[10px] font-label uppercase rounded-full px-2 py-0.5",
              status === "active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
              status === "pending" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
              "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
            )}
          >
            {status === "active" ? "Activo" : status === "pending" ? "Invitado" : "Declinado"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
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
              <DropdownMenuItem onClick={() => onUpdateRole(member.id, member.role === "admin" ? "member" : "admin")}>
                <Shield className="mr-2 h-4 w-4" />
                <span>{member.role === "admin" ? "Degradar a Miembro" : "Hacer Administrador"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10"
                onClick={() => onRemove(member.id)}
              >
                <UserMinus className="mr-2 h-4 w-4" />
                <span>Eliminar del espacio</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="rounded-[24px] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 overflow-hidden shadow-sm p-4">
      <DataTable 
        columns={columns} 
        data={members} 
        isLoading={isLoading}
      />
    </div>
  );
};
