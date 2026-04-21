import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analytics/analyticsService.js';

interface UsageItem {
  type: 'ai' | 'storage';
  label: string;
  usage: number;
  limit: number;
  unit?: string;
}

interface UsageMeterProps {
  workspaceId: string;
}

export const UsageMeter: React.FC<UsageMeterProps> = ({ workspaceId }) => {
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const data = await analyticsService.getWorkspaceUsage(workspaceId);
        setUsage(data);
      } catch (error) {
        console.error('Failed to fetch usage', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [workspaceId]);

  if (loading) return <div className="animate-pulse h-20 bg-gray-100 rounded-lg dark:bg-gray-800" />;
  if (!usage) return null;

  const items: UsageItem[] = [
    {
      type: 'ai',
      label: 'AI Requests',
      usage: usage.ai.usage,
      limit: usage.ai.limit,
    },
    {
      type: 'storage',
      label: 'Storage',
      usage: usage.storage.usage,
      limit: usage.storage.limit,
      unit: 'MB',
    },
  ];

  return (
    <div className="space-y-4 p-4 border rounded-xl bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center justify-between">
         <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Workspace Usage</h3>
         <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium uppercase tracking-wider">
           {usage.plan.toUpperCase()}
         </span>
      </div>
      {items.map((item) => {
        const percentage = Math.min((item.usage / item.limit) * 100, 100);
        const isNearLimit = percentage > 80;
        const isOverLimit = percentage >= 100;

        return (
          <div key={item.type} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400 font-medium">{item.label}</span>
              <span className={isOverLimit ? 'text-red-500 font-bold' : 'text-gray-500'}>
                {item.usage} / {item.limit} {item.unit || ''}
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
