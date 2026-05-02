import { FC } from "react";
import { cn } from "@/utils/classNames";
import { Sparkles } from "lucide-react";
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from "@node-stack/ui";

interface WelcomeBannerProps {
  name: string;
  avatarUrl?: string;
  className?: string;
}

export const WelcomeBanner: FC<WelcomeBannerProps> = ({
  name,
  avatarUrl,
  className,
}) => {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-[32px] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 p-6 transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative">
          <Avatar className="w-12 h-12 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
            <AvatarImage src={avatarUrl || "https://avatars.githubusercontent.com/u/107328372?v=4"} alt={name} />
            <AvatarFallback className="bg-slate-50 dark:bg-white/5 text-[10px] font-label uppercase text-slate-400">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0F172A] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-heading text-slate-900 dark:text-white">
              ¡Hola, {name}!
            </h2>
            <Sparkles className="w-4 h-4 text-[#00E6E6]" />
          </div>
          <p className="text-[12px] font-label text-slate-400 mt-0.5">
            Tienes 3 tareas pendientes para completar la configuración de tu plataforma.
          </p>
        </div>
      </div>
      
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full -mr-10 -mt-10" />
    </div>
  );
};
