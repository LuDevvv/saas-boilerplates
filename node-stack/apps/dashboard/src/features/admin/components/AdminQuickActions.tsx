import { FC } from "react";
import { UserPlus, ShieldCheck, Zap } from "lucide-react";

export const AdminQuickActions: FC = () => {
  return (
    <div className="flex items-center gap-3">
      <button className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-heading text-gray-700 shadow-sm hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-2 dark:bg-gray-900 dark:border-white/10 dark:text-gray-300">
        <UserPlus className="h-4 w-4" />
        Add User
      </button>
      <button className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-heading text-gray-700 shadow-sm hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-2 dark:bg-gray-900 dark:border-white/10 dark:text-gray-300">
        <ShieldCheck className="h-4 w-4" />
        Security
      </button>
      <button className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-heading text-gray-700 shadow-sm hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-2 dark:bg-gray-900 dark:border-white/10 dark:text-gray-300">
        <Zap className="h-4 w-4" />
        Settings
      </button>
    </div>
  );
};