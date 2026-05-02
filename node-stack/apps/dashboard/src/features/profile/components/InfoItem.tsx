import { FC } from "react";
import { LucideIcon } from "lucide-react";
import { Badge } from "@node-stack/ui";
import { CheckCircle2 } from "lucide-react";

interface InfoItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
  badge?: string;
}

export const InfoItem: FC<InfoItemProps> = ({ icon: Icon, label, value, badge }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-label text-gray-400 uppercase mb-0.5">{label}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm font-heading text-gray-950 dark:text-white truncate">{value}</p>
        {badge && (
          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/30 py-0 px-2 h-5 text-[10px] font-label uppercase flex items-center gap-1">
            <CheckCircle2 className="h-2.5 w-2.5" />
            {badge}
          </Badge>
        )}
      </div>
    </div>
  </div>
);