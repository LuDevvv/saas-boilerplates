import { FC } from "react";
import { ArrowUpCircle } from "lucide-react";
import { cn } from "@/utils/classNames";

interface SidebarWidgetProps {
  isCollapsed: boolean;
}

export const UpgradePremiumWidget: FC<SidebarWidgetProps> = ({ isCollapsed }) => {
  return (
    <div>
      <div className={cn(
        "relative group overflow-hidden transition-all duration-500 active:scale-95 cursor-pointer",
        "rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-blue-900/20",
        isCollapsed ? "h-10 w-10" : "h-auto pl-5 pr-4 py-4"
      )}>
        {/* Expandable Content */}
        {!isCollapsed && (
          <div className="flex flex-col gap-3 animate-fade-in-fast">
            <div className="flex flex-col gap-[2px] pr-2">
              {/* <div className="flex items-center gap-2">
                <span className="text-[10px] font-label uppercase  text-white/90">
                  Plan Premium
                </span>
              </div> */}
              <h4 className="text-[13px] font-heading text-white leading-snug">
                Libera todo el potencial de tu negocio
              </h4>
              <p className="text-[10px] text-white/70 leading-relaxed font-label">
                IA avanzada y analytics en tiempo real.
              </p>
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-[11px] font-heading text-primary shadow-sm transition-all hover:bg-white/90">
              Mejorar ahora
              <ArrowUpCircle className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const TrialStatusWidget: FC<SidebarWidgetProps> = ({ isCollapsed }) => {
  const daysLeft = 12;
  const progress = (daysLeft / 14) * 100;

  return (
    <div>
      <div className={cn(
        "relative flex items-center transition-all duration-500 rounded-2xl border border-sidebar-border bg-gray-50/50 dark:bg-white/5",
        isCollapsed ? "h-10 w-10" : "pl-5 pr-4 py-4"
      )}>
        {/* Stable Circular Progress - Centered at 36px (16px parent + 20px center = 36px) */}
        <div className={cn(
          "absolute left-0 top-0 h-10 w-10 flex items-center justify-center transition-all duration-500",
          !isCollapsed && "relative h-8 w-8 mr-[6px]"
        )} title={`Prueba: ${daysLeft} días restantes`}>
          <div className="h-8 w-8 relative">
            <svg className="h-full w-full" viewBox="0 0 24 24">
              <circle
                cx="12" cy="12" r="10"
                fill="none"
                className="stroke-gray-200 dark:stroke-white/10"
                strokeWidth="2.5"
              />
              <circle
                cx="12" cy="12" r="10"
                fill="none"
                className="stroke-primary"
                strokeWidth="2.5"
                strokeDasharray="62.8"
                strokeDashoffset={62.8 - (62.8 * progress) / 100}
                strokeLinecap="round"
                transform="rotate(-90 12 12)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-heading text-primary">{daysLeft}</span>
            </div>
          </div>
        </div>

        {/* Expandable Info */}
        {!isCollapsed && (
          <div className="flex flex-1 flex-col gap-1.5 animate-fade-in-fast overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-label text-sidebar-text">
                Prueba
              </span>
              <span className="text-[10px] font-label text-sidebar-text/50">
                {daysLeft}d restantes
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-sidebar-border">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
