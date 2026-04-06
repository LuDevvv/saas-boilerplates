import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface VariantCardSkeletonProps {
  count?: number;
}

const VariantCardSkeleton: FC<VariantCardSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="card-premium flex flex-col h-full w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm"
        >
          {/* Thumbnail */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
            <Skeleton
              height="100%"
              containerClassName="block h-full leading-none"
            />
          </div>

          {/* Content Section */}
          <div className="flex flex-col flex-1 p-3.5 sm:p-5 gap-2 sm:gap-3.5 min-w-0">
            {/* Title */}
            <div className="flex flex-col gap-1 sm:gap-2">
              <Skeleton height={20} width="80%" />
              <Skeleton height={24} width="40%" />
            </div>

            {/* Buttons */}
            <div className="mt-auto pt-2 sm:pt-4">
              <div className="flex gap-2 sm:gap-3">
                <Skeleton
                  height={40}
                  containerClassName="flex-1"
                  borderRadius={12}
                />
                <Skeleton height={40} width={40} borderRadius={12} />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default VariantCardSkeleton;
