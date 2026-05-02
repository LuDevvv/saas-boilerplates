import { FC } from "react";
import { CheckCircle2, Circle, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/utils/classNames";

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  actionPath: string;
}

interface OnboardingProgressProps {
  userName: string;
  tasks: OnboardingTask[];
  onDismiss: () => void;
}

export const OnboardingProgress: FC<OnboardingProgressProps> = ({
  userName,
  tasks,
  onDismiss,
}) => {
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercentage = (completedCount / tasks.length) * 100;

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-primary-100 bg-white shadow-premium dark:border-white/10 dark:bg-gray-900/50 animate-fade-in p-8">
      {/* Background Decorative Sparkles - Subtle Gradient */}
      <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-primary-500/10 to-indigo-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-[10px] font-label text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 uppercase ">
            <Sparkles className="h-3.5 w-3.5" />
            Guía de Inicio Rápido
          </div>

          <h2 className="text-3xl font-heading text-gray-950 dark:text-white  leading-tight">
            ¡Hola {userName}! <br />
            <span className="text-primary-600 dark:text-primary-400 font-heading text-2xl opacity-90 ">Empecemos a configurar tu espacio.</span>          </h2>

          <div className="space-y-3 max-w-sm">
            <div className="flex items-center justify-between text-[11px] font-label uppercase ">
              <span className="text-gray-400">Progreso de configuración</span>
              <span className="text-primary-600 dark:text-primary-400">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full bg-primary-600 shadow-[0_0_10px_rgba(113,68,249,0.4)] transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          {tasks.map((task) => (
            <button
              key={task.id}
              className={cn(
                "group flex items-start gap-4 rounded-[20px] border p-5 transition-all duration-300 text-left active:scale-95",
                task.completed
                  ? "bg-gray-50/50 border-transparent dark:bg-white/5 opacity-60"
                  : "bg-white border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-md dark:bg-gray-800 dark:border-white/10 dark:hover:border-white/20"
              )}
            >
              <div className={cn(
                "mt-0.5 rounded-full p-0.5 transition-colors",
                task.completed ? "text-green-500" : "text-gray-300 group-hover:text-primary-500"
              )}>
                {task.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn(
                  "text-sm font-heading truncate",
                  task.completed ? "text-gray-500 line-through" : "text-gray-900 dark:text-white"
                )}>
                  {task.title}
                </p>
                <p className="mt-1 text-xs text-gray-500 line-clamp-1 leading-relaxed">{task.description}</p>
              </div>
              {!task.completed && <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary-500 transition-transform group-hover:translate-x-1" />}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="absolute right-6 top-6 text-[10px] font-label text-gray-400 uppercase  hover:text-gray-900 dark:hover:text-white transition-colors p-2"
      >
        Omitir guía
      </button>
    </div>
  );
};
