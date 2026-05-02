import { FC } from "react";
import { LucideIcon } from "lucide-react";
import { LinkTransition } from "@/components/utils/LinkTransition";
import { cn } from "@/lib/utils";

export interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
  route: string;
  color: string;
  bg: string;
  iconBg: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export const QuickActions: FC<QuickActionsProps> = ({ actions, className }) => {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-6", className)}>
      {actions.map((action, i) => (
        <LinkTransition
          key={i}
          href={action.route}
          className={cn(
            "group flex flex-col items-center text-center gap-4 p-6 rounded-[32px] transition-all duration-500 hover:-translate-y-1 active:scale-95",
            action.bg
          )}
        >
          <div
            className={cn(
              "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
              action.iconBg
            )}
          >
            <action.icon className={cn("h-7 w-7", action.color)} />
          </div>
          <div className="space-y-1">
            <span className="text-[14px] font-heading text-slate-900 dark:text-white block">
              {action.label}
            </span>
            <p className="text-[10px] font-label text-slate-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {action.description}
            </p>
          </div>
        </LinkTransition>
      ))}
    </div>
  );
};