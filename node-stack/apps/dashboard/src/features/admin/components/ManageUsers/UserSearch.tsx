import { FC } from "react";
import { Search } from "lucide-react";
import { cn } from "@/utils/classNames";

interface UserSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const UserSearch: FC<UserSearchProps> = ({ value, onChange }) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search by name, email, or ID..."
        className={cn(
          "w-full rounded-2xl border border-gray-100 bg-gray-50/50 pl-11 pr-4 py-2.5 text-sm",
          "focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10",
          "dark:border-white/5 dark:bg-gray-800 dark:text-white transition-all"
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};