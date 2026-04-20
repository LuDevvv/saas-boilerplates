import React, { useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { cn } from '@/utils/classNames';

interface UsageMeterProps {
  className?: string;
  isCollapsed?: boolean;
}

const UsageMeter: React.FC<UsageMeterProps> = ({ className, isCollapsed }) => {
  const { usage, loading, fetchUsage } = useWorkspaceStore();

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  if (loading && usage.length === 0) {
    return (
      <div className={cn("animate-pulse space-y-3", className)}>
        <div className="h-2 w-24 bg-gray-200 dark:bg-gray-800 rounded-full" />
        <div className="h-4 w-full bg-gray-100 dark:bg-gray-900 rounded-xl" />
      </div>
    );
  }

  if (isCollapsed) {
    // Only show a small indicator if collapsed
    return (
      <div className={cn("flex justify-center", className)}>
        <div 
          className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
          title="Consumo de recursos"
        />
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.08] shadow-sm",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Uso del Plan
        </h3>
        <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
          Pro
        </span>
      </div>

      <div className="space-y-4">
        {usage.map((item, idx) => {
          const percentage = Math.min(Math.round((item.used / item.total) * 100), 100);
          
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
                <span className="text-gray-500 dark:text-gray-500">
                  {item.used} / {item.total} {item.unit}
                </span>
              </div>
              
              <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(var(--tw-shadow-color),0.3)]",
                    item.color === 'indigo' ? "bg-indigo-500" :
                    item.color === 'sky'    ? "bg-sky-500" :
                    item.color === 'violet' ? "bg-violet-500" : 
                    "bg-indigo-500"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button className="mt-4 w-full py-2 px-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-950 text-[11px] font-black uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer">
        Actualizar Plan
      </button>
    </div>
  );
};

export default UsageMeter;
