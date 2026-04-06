import { FC } from "react";

const CompanySkeleton: FC = () => {
  return (
    <div className="w-full animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section - Logo & ID */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-center shadow-sm relative overflow-hidden h-[420px]">
            <div className="absolute top-0 inset-x-0 h-32 bg-gray-100 dark:bg-gray-800/50" />
            
            <div className="relative mb-8 z-10 mt-2">
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700/50 border-4 border-white dark:border-gray-900 shadow-md" />
              <div className="absolute bottom-1 right-1 bg-gray-200 dark:bg-gray-700 w-10 h-10 rounded-full border-4 border-white dark:border-gray-900" />
            </div>

            <div className="w-full mb-8 relative z-10 flex flex-col items-center">
              <div className="h-8 bg-gray-200 dark:bg-gray-700/50 rounded-lg w-3/4 mb-6" />
              <div className="w-full h-14 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-xl" />
            </div>

            <div className="w-full mt-auto relative z-10">
              <div className="h-11 bg-gray-200 dark:bg-gray-700/50 rounded-xl w-full" />
            </div>
          </div>
        </div>

        {/* Right Section - Content */}
        <div className="lg:col-span-8 flex flex-col min-h-[420px]">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800/50 shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="p-8 pb-6 border-b border-gray-50 dark:border-white/5 space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700/50 rounded-md w-1/3" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded-md w-1/2" />
            </div>

            <div className="p-8 space-y-10">
              {/* Mission Placeholder */}
              <div className="bg-gray-50/50 dark:bg-gray-900/50 rounded-[2rem] p-8 border border-gray-100 dark:border-white/5 space-y-4">
                <div className="h-3 bg-gray-200 dark:bg-gray-700/50 rounded-md w-1/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded-md w-full" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded-md w-5/6" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded-md w-4/6" />
                </div>
              </div>

              {/* Branches Placeholder */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-50 dark:border-white/5 pb-4">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700/50 rounded-md w-1/4" />
                  <div className="h-6 bg-gray-100 dark:bg-gray-800/50 rounded-full w-24" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-40 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-3xl" />
                  <div className="h-40 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-3xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySkeleton;
