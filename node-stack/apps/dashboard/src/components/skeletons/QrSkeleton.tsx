export const QrSkeleton = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 w-full animate-pulse">
      {/* Left Column: Preview & Actions */}
      <div className="w-full lg:w-[380px] shrink-0">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xl space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary-200 dark:bg-primary-900"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-28 text-xs font-bold uppercase"></div>
            </div>
            <div className="w-16 h-4 bg-green-100 dark:bg-green-900/50 rounded-full"></div>
          </div>

          <div className="rounded-[2.5rem] bg-gray-100/50 dark:bg-gray-800/30 h-[380px] border border-gray-100 dark:border-gray-800/50 p-6 flex flex-col items-center shadow-inner">
            {/* Logo placeholder */}
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-3xl mb-10 shadow-sm border-4 border-white dark:border-gray-800"></div>
            {/* Title placeholder */}
            <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700/80 rounded-lg mb-8"></div>
            {/* Qr square placeholder */}
            <div className="w-40 h-40 bg-gray-200 dark:bg-gray-700/50 rounded-2xl"></div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </div>

      {/* Right Column: Controls */}
      <div className="flex-1 space-y-6">
        {/* Url Display placeholder */}
        <div className="mb-5 md:mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
            <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          </div>
          <div className="h-12 bg-gray-100 dark:bg-gray-800/50 rounded-2xl shadow-inner border border-gray-200/50 dark:border-gray-800"></div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-lg space-y-8">
          {/* Preset Styles placeholder */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
              <div className="w-40 h-4 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-1/3 mb-2"></div>

            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-gray-100 dark:border-gray-800"
                ></div>
              ))}
            </div>
          </div>

          <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />

          {/* Qr Dots Styles placeholder */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
              <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-gray-100 dark:border-gray-800"
                ></div>
              ))}
            </div>
          </div>

          <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />

          {/* Colors box placeholder */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                  <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                </div>
                <div className="h-14 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-gray-100 dark:border-gray-800"></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded-sm"></div>
                  <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                </div>
                <div className="h-14 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-gray-100 dark:border-gray-800"></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-40 h-4 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 sm:h-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-gray-100 dark:border-gray-800"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
