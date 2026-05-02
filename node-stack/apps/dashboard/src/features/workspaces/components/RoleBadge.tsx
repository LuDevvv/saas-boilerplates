import { FC } from "react";
import { Badge } from "@node-stack/ui";
import { cn } from "@/utils/classNames";

interface RoleBadgeProps {
  role: "owner" | "admin" | "member" | "guest";
  className?: string;
}

const roleMap = {
  owner: { label: "Propietario", color: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" },
  admin: { label: "Administrador", color: "bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20" },
  member: { label: "Miembro", color: "bg-slate-50 text-slate-700 border-slate-100 dark:bg-white/5 dark:text-slate-400 dark:border-white/10" },
  guest: { label: "Invitado", color: "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20" },
};

export const RoleBadge: FC<RoleBadgeProps> = ({ role, className }) => {
  const config = roleMap[role] || roleMap.member;
  
  return (
    <Badge 
      variant="outline" 
      className={cn("font-label text-[10px] uppercase px-2 py-0.5 rounded-full border", config.color, className)}
    >
      {config.label}
    </Badge>
  );
};
