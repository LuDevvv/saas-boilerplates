import { FC } from "react";
import { Calendar } from "lucide-react";
import { Button, Card, Badge } from "@node-stack/ui";

interface PlanCardProps {
  isPremium: boolean;
  planName: string;
  price: string;
  daysRemaining: number;
  nextBillingDate: string;
  onUpgrade: () => void;
  onCancel: () => void;
  className?: string;
}

export const PlanCard: FC<PlanCardProps> = ({
  isPremium,
  planName = "Plan Gratuito",
  price = "$0.00",
  daysRemaining = 0,
  nextBillingDate = "",
  onUpgrade,
  onCancel,
  className,
}) => {
  return (
    <Card className={`card-premium p-6 flex flex-col h-full border-[var(--border)] shadow-sm bg-[var(--surface)] ${className || ""}`}>
      <div className="flex flex-col items-start w-full h-full">
        <div className="flex items-center justify-between w-full mb-6">
          <div className="space-y-0.5">
            <p className="text-[10px] font-label uppercase text-gray-400">Plan Actual</p>
            <h3 className="text-xl font-heading text-gray-950 dark:text-white">
              {planName}
            </h3>
          </div>
          {isPremium && (
            <Badge className="bg-gray-50 text-gray-500 dark:bg-white/5 border-none px-2 py-0.5 h-5 text-[9px] font-label uppercase">
              {daysRemaining} días restantes
            </Badge>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-8">
          <span className="text-3xl font-kpi text-gray-950 dark:text-white">{price}</span>
          <span className="text-[10px] font-label text-gray-400 uppercase">/ mes</span>
        </div>

        <div className="w-full space-y-5 pt-6 border-t border-[var(--border)] mt-auto">
          {isPremium && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] font-label text-gray-400 uppercase">Próximo cargo</p>
                <p className="text-xs font-heading text-gray-900 dark:text-white">{nextBillingDate}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-1">
            {!isPremium ? (
              <Button
                onClick={onUpgrade}
                className="w-full rounded-xl bg-primary hover:bg-primary-600 text-white font-label uppercase text-[10px] h-10 active:scale-95 transition-all shadow-md shadow-blue-900/10"
              >
                Mejorar Plan
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={onUpgrade}
                  className="btn-secondary w-full h-10"
                >
                  Cambiar Plan
                </Button>
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  className="w-full text-[10px] font-label uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl h-10 transition-colors"
                >
                  Anular mi plan
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};