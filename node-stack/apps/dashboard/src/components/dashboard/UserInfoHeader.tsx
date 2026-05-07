import { FC } from "react";
import { cn } from "@/utils/classNames";

interface UserInfoHeaderProps {
  name: string;
  status: string;
  date: string;
  avatarUrl?: string;
  className?: string;
}

export const UserInfoHeader: FC<UserInfoHeaderProps> = ({
  name,
  status,
  date,
  avatarUrl,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-row items-center gap-5 pb-6 border-b border-border dark:border-white/10 w-full mb-2",
        className
      )}
    >
      <div className="flex-shrink-0 relative group">
        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <img
          src={avatarUrl || "https://avatars.githubusercontent.com/u/107328372?v=4"}
          alt={name}
          className="w-16 h-16 rounded-[20px] object-cover shadow-sm border-2 border-white dark:border-gray-800 relative z-10 transition-transform duration-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl md:text-4xl font-heading text-fg leading-none ">
            ¡Hola, {name}!
          </h2>
          <span className="text-3xl animate-bounce-subtle" role="img" aria-label="wave">👋</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <p className="text-sm md:text-base text-fg-secondary font-label uppercase  opacity-80">
            {status}
          </p>
        </div>
      </div>

      <div className="ml-auto flex flex-col items-end">
        <div className="text-[10px] font-label text-primary uppercase  mb-1">
          Current Date
        </div>
        <div className="text-lg md:text-xl font-heading text-fg ">
          {date}
        </div>
      </div>
    </div>
  );
};
