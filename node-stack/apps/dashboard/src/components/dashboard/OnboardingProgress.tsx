import { CheckCircle2, Circle, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/utils/classNames";
import { useNavigate } from "react-router-dom";

interface Step {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    path: string;
    icon: any;
}

export const OnboardingProgress = ({
    steps = []
}: {
    steps: Step[]
}) => {
    const navigate = useNavigate();
    const completedCount = steps.filter(s => s.completed).length;
    const progressPercent = (completedCount / steps.length) * 100;

    if (completedCount === steps.length) return null;

    return (
        <div id="onboarding-progress" className="w-full mb-8 animate-fade-in-up">
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 shadow-premium overflow-hidden relative">
                {/* Acento de fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl border border-blue-100 dark:border-blue-800">
                                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                    ¡Casi listo para lanzar! 🚀
                                </h3>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Completa estos pasos para activar tu menú digital premium.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                    Progreso de activación
                                </span>
                                <p className="text-lg font-black text-gray-900 dark:text-white leading-none">
                                    {Math.round(progressPercent)}%
                                </p>
                            </div>
                            <div className="w-32 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200/50 dark:border-gray-700">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000 ease-out-expo"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {steps.map((step) => (
                            <button
                                key={step.id}
                                onClick={() => !step.completed && navigate(step.path)}
                                className={cn(
                                    "p-5 rounded-2xl border transition-all duration-300 text-left group relative overflow-hidden",
                                    step.completed
                                        ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/20 opacity-80"
                                        : "bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5"
                                )}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={cn(
                                        "p-2.5 rounded-xl border transition-colors",
                                        step.completed
                                            ? "bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                                            : "bg-gray-50 text-gray-400 border-gray-100 dark:bg-gray-800 dark:border-gray-700 group-hover:text-blue-500 group-hover:border-blue-200 dark:group-hover:border-blue-500/30"
                                    )}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    {step.completed ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-gray-200 dark:text-gray-700 group-hover:text-blue-200" />
                                    )}
                                </div>

                                <h4 className={cn(
                                    "text-sm font-bold tracking-tight mb-1",
                                    step.completed ? "text-emerald-700 dark:text-emerald-400" : "text-gray-900 dark:text-white"
                                )}>
                                    {step.title}
                                </h4>
                                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 leading-normal">
                                    {step.description}
                                </p>

                                {!step.completed && (
                                    <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
