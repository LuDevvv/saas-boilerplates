import { cn } from "@/utils/classNames";

export interface TabOption<T extends string> {
  id: T;
  label: string;
}

interface TabNavigationProps<T extends string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
}

export const TabNavigation = <T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
}: TabNavigationProps<T>) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap",
              isActive
                ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
