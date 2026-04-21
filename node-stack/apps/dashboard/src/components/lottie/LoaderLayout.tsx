import { LottieAnimation } from "./LottieAnimation.js";

interface LoaderLayoutProps {
  animationData?: object;
  path?: string;
  title?: string;
  subtitle?: string;
  animationClassName?: string;
  containerClassName?: string;
  overlay?: boolean;
  overlayClassName?: string;
}

/**
 * Full-page loader layout with Lottie animation
 *
 * @example
 * <LoaderLayout
 *   animationData={loaderAnimation}
 *   title="Loading..."
 *   subtitle="Please wait while we process your request"
 * />
 */
const LoaderLayout = ({
  animationData,
  path,
  title,
  subtitle,
  animationClassName = "w-64 h-64 md:w-96 md:h-96",
  containerClassName = "",
  overlay = false,
  overlayClassName = "",
}: LoaderLayoutProps) => {
  const baseClasses = overlay
    ? "fixed inset-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
    : "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800";

  // Prepare Lottie props based on which source is provided
  const lottieProps = animationData
    ? { animationData }
    : path
      ? { path }
      : { animationData: {} }; // Fallback

  return (
    <section
      className={`${baseClasses} flex flex-col items-center justify-center p-4 ${overlayClassName}`}
    >
      <div className={`flex flex-col items-center gap-6 ${containerClassName}`}>
        <LottieAnimation
          {...lottieProps}
          className={animationClassName}
          loop
          autoplay
        />

        {(title || subtitle) && (
          <div className="text-center space-y-2 max-w-md">
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white animate-pulse">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export { LoaderLayout };
export type { LoaderLayoutProps };
