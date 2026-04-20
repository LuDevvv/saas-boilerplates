import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/classNames";

interface EmptyStateMessageProps {
  icon: LucideIcon;
  title: string;
  message: string;
  iconSize?: number;
  action?: React.ReactNode;
  className?: string;
  tutorialVideoId?: number;
  tutorialTitle?: string;
}

const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({
  icon: Icon,
  title,
  message,
  iconSize = 48,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "card-premium flex flex-col items-center justify-center py-16 px-8 text-center w-full",
        className
      )}
    >
      <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-6 border border-gray-100 dark:border-gray-700">
        <Icon
          size={iconSize}
          strokeWidth={1.5}
          className="text-gray-400 dark:text-gray-500"
        />
      </div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed mb-6">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {action}
      </div>
    </div>
  );
};

export default EmptyStateMessage;
