import { Search } from "lucide-react";
import { FC } from "react";

import { cn } from "@/utils/classNames";

interface UserSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const UserSearch: FC<UserSearchProps> = ({ value, onChange }) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
      <input
        type="text"
        placeholder="Search by name, email, or ID..."
        className={cn(
          "w-full rounded-xl border border-border bg-surface-muted pl-11 pr-4 py-2.5 text-sm text-fg",
          "placeholder:text-fg-muted",
          "focus:border-primary focus:outline-none transition-all"
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
