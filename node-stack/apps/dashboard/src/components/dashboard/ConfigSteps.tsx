import { FC } from "react";
import { cn } from "@/utils/classNames";
import { 
  CheckCircle2, 
  ChevronRight
} from "lucide-react";
import { Button } from "@node-stack/ui";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  active?: boolean;
  onClick?: () => void;
}

interface ConfigStepsProps {
  steps: Step[];
  className?: string;
}

export const ConfigSteps: FC<ConfigStepsProps> = ({ steps, className }) => {
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-[11px] font-label uppercase text-slate-400">Pasos de Configuración</h3>
          <p className="text-xl font-heading text-slate-900 dark:text-white mt-1">Completa tu plataforma</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-label uppercase text-[#004080] dark:text-[#00E6E6]">
            {completedCount}/{steps.length} Completados
          </span>
          <div className="w-32 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-[#004080] dark:bg-[#00E6E6] transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "group relative flex flex-col p-6 rounded-[28px] border transition-all duration-300",
              step.completed 
                ? "bg-emerald-50/30 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/10" 
                : step.active
                  ? "bg-white border-[#004080] dark:bg-white/5 dark:border-[#00E6E6] shadow-xl shadow-[#004080]/5"
                  : "bg-white border-slate-100 dark:bg-white/5 dark:border-white/10 hover:border-slate-200"
            )}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                step.completed 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : step.active
                    ? "bg-[#004080] text-white shadow-lg shadow-[#004080]/20 dark:bg-[#00E6E6] dark:text-[#004080]"
                    : "bg-slate-50 dark:bg-white/5 text-slate-400"
              )}>
                <step.icon className="w-5 h-5" />
              </div>
              {step.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-white/10" />
              )}
            </div>

            <div className="flex-1">
              <h4 className={cn(
                "text-[14px] font-heading transition-colors mb-1",
                step.completed ? "text-emerald-900 dark:text-emerald-400" : "text-slate-900 dark:text-white"
              )}>
                {step.title}
              </h4>
              <p className="text-[11px] font-label text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "w-full rounded-xl text-[10px] font-label uppercase tracking-wider h-10",
                  step.completed 
                    ? "text-emerald-600 hover:bg-emerald-500/10" 
                    : step.active
                      ? "bg-[#004080] text-white hover:bg-[#003366] dark:bg-[#00E6E6] dark:text-[#004080]"
                      : "text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                )}
                onClick={() => step.onClick?.()}
              >
                {step.completed ? "Revisar" : "Completar"}
                <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
