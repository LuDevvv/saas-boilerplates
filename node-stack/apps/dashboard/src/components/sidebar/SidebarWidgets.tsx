import { ArrowUpCircle, Zap } from "lucide-react";
import { FC } from "react";

interface SidebarWidgetProps {
  isCollapsed: boolean;
}

interface UpgradePremiumWidgetProps extends SidebarWidgetProps {
  offerLabel?: string;
  price?: string;
  period?: string;
  description?: string;
}

interface TrialStatusWidgetProps extends SidebarWidgetProps {
  daysLeft?: number;
  totalDays?: number;
  description?: string;
}

export const UpgradePremiumWidget: FC<UpgradePremiumWidgetProps> = ({
  isCollapsed,
  offerLabel = "-50% OFF",
  price = "$25",
  period = "mes",
  description = "IA avanzada y analytics en tiempo real para tu negocio."
}) => {
  if (isCollapsed) {
    return (
      <div className="flex justify-center w-full px-0">
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary shadow-lg cursor-pointer active:scale-95 transition-colors overflow-hidden">
          <Zap className="h-5 w-5 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-[160px] rounded-[18px] bg-gradient-to-br from-primary via-primary to-secondary shadow-premium p-3 relative overflow-hidden">
      <div className="relative z-10 flex flex-col">
        <h4 className="text-[12px] font-medium text-white leading-tight mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
          Libera todo el potencial
        </h4>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-baseline gap-0.5 whitespace-nowrap">
            <span className="text-base font-medium text-white ">{price}</span>
            <span className="text-[9px] font-medium text-white/60 ">/{period}</span>
          </div>
          <span className="bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[8px] font-medium text-white uppercase  border border-white/10 whitespace-nowrap">
            {offerLabel}
          </span>
        </div>

        <p className="text-[10px] text-white/70 leading-snug mb-3 line-clamp-2">
          {description}
        </p>

        <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-1.5 text-[10px] font-bold text-primary active:scale-95 transition-colors whitespace-nowrap overflow-hidden">
          <span className="truncate">Mejorar ahora</span>
          <ArrowUpCircle className="h-3 w-3 shrink-0" />
        </button>
      </div>
    </div>
  );
};

const CircularProgress: FC<{ daysLeft: number; progress: number }> = ({ daysLeft, progress }) => (
  <div className="h-9 w-9 relative shrink-0">
    <svg className="h-full w-full -rotate-90" viewBox="0 0 24 24">
      <circle
        cx="12" cy="12" r="10"
        fill="none"
        className="stroke-muted/10"
        strokeWidth="3"
      />
      <circle
        cx="12" cy="12" r="10"
        fill="none"
        className="stroke-primary"
        strokeWidth="3"
        strokeDasharray="62.8"
        strokeDashoffset={62.8 - (62.8 * progress) / 100}
        strokeLinecap="round"
      />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-[10px] font-bold text-primary leading-none ">{daysLeft}</span>
    </div>
  </div>
);



export const TrialStatusWidget: FC<TrialStatusWidgetProps> = ({
  isCollapsed,
  daysLeft = 7,
  totalDays = 14,
  description = "Obtén flujos de trabajo más rápidos y límites superiores."
}) => {
  const progress = (daysLeft / totalDays) * 100;

  if (isCollapsed) {
    return (
      <div className="flex justify-center w-full px-0">
        <div
          className="h-10 w-10 flex items-center justify-center rounded-full border border-border bg-surface shadow-sm cursor-pointer hover:bg-surface-hover active:scale-95 transition-colors"
          title={`Prueba: ${daysLeft} días restantes`}
        >
          <CircularProgress daysLeft={daysLeft} progress={progress} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-[160px] rounded-[18px] border border-border bg-surface p-3 shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-[9px] font-bold text-fg-muted uppercase tracking-wider">Prueba</span>
        </div>
        <div className="flex items-baseline gap-1 whitespace-nowrap">
          <span className="text-sm font-black text-fg">{daysLeft}</span>
          <span className="text-[9px] font-bold text-fg-muted uppercase">días</span>
        </div>
      </div>

      <div className="relative h-1 w-full rounded-full bg-primary/10 overflow-hidden mb-2.5">
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-[10px] font-medium text-fg-secondary leading-snug mb-3 line-clamp-2">
        {description}
      </p>

      <button className="w-full flex items-center justify-center h-8 rounded-lg bg-primary text-primary-foreground text-[10px] font-black active:scale-95 transition-colors whitespace-nowrap overflow-hidden truncate px-2 hover:bg-primary-600">
        Mejorar ahora
      </button>
    </div>
  );
};
