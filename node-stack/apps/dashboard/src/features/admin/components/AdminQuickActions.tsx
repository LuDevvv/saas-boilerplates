import { Users, Settings, Zap, LayoutGrid, Activity } from "lucide-react";
import { FC } from "react";
import { Link } from "react-router-dom";

const QuickLink: FC<{ to: string; icon: typeof Users; label: string }> = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    className="rounded-xl border border-border bg-surface px-4 py-2.5 text-[13px] font-medium text-fg-secondary hover:bg-surface-hover hover:text-fg hover:border-border-strong transition-all active:scale-95 flex items-center gap-2"
  >
    <Icon className="h-4 w-4" />
    {label}
  </Link>
);

export const AdminQuickActions: FC = () => (
  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
    <QuickLink to="/admin/users" icon={Users} label="Usuarios" />
    <QuickLink to="/admin/workspaces" icon={LayoutGrid} label="Workspaces" />
    <QuickLink to="/admin/feature-flags" icon={Zap} label="Feature Flags" />
    <QuickLink to="/admin/config" icon={Settings} label="Config" />
    <QuickLink to="/admin/audit" icon={Activity} label="Auditoría" />
  </div>
);
