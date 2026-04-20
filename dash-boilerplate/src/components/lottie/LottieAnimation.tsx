import { useEffect, useRef, useState } from "react";
import lottie from "lottie-web/build/player/lottie_light";
import type {
  AnimationItem,
  AnimationConfigWithData,
  AnimationConfigWithPath,
} from "lottie-web";

interface BaseLottieProps {
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  renderer?: "svg" | "canvas" | "html";
  speed?: number;
  onComplete?: () => void;
  onLoopComplete?: () => void;
  onEnterFrame?: () => void;
}

interface LottieWithData extends BaseLottieProps {
  animationData: object;
  path?: never;
}

interface LottieWithPath extends BaseLottieProps {
  path: string;
  animationData?: never;
}

type LottieAnimationProps = LottieWithData | LottieWithPath;

/**
 * Reusable Lottie Animation Component
 *
 * @example
 * // With imported JSON
 * <LottieAnimation
 *   animationData={animationFile}
 *   className="w-64 h-64"
 * />
 *
 * @example
 * // With URL path
 * <LottieAnimation
 *   path="/animations/loader.json"
 *   className="w-full h-full"
 *   loop={false}
 * />
 */
const LottieAnimation = ({
  animationData,
  path,
  loop = true,
  autoplay = true,
  className = "w-full h-full",
  renderer = "svg",
  speed = 1,
  onComplete,
  onLoopComplete,
  onEnterFrame,
}: LottieAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);
  const [isLoading, setIsLoading] = useState(!!path);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: AnimationConfigWithData | AnimationConfigWithPath = {
      container: containerRef.current,
      renderer: renderer as "svg", // Type assertion to fix renderer type issue
      loop,
      autoplay,
      ...(animationData ? { animationData } : { path }),
    };

    try {
      const anim = lottie.loadAnimation(config);
      animationRef.current = anim;

      // Set speed
      anim.setSpeed(speed);

      // Event listeners
      if (onComplete) {
        anim.addEventListener("complete", onComplete);
      }
      if (onLoopComplete) {
        anim.addEventListener("loopComplete", onLoopComplete);
      }
      if (onEnterFrame) {
        anim.addEventListener("enterFrame", onEnterFrame);
      }

      // Handle loading state for path-based animations
      if (path) {
        anim.addEventListener("DOMLoaded", () => setIsLoading(false));
        anim.addEventListener("data_failed", () => {
          setError("Failed to load animation");
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }

      return () => {
        if (onComplete) anim.removeEventListener("complete", onComplete);
        if (onLoopComplete)
          anim.removeEventListener("loopComplete", onLoopComplete);
        if (onEnterFrame) anim.removeEventListener("enterFrame", onEnterFrame);
        anim.destroy();
        animationRef.current = null;
      };
    } catch (err) {
      setError("Failed to initialize animation");
      setIsLoading(false);
      console.error("Lottie animation error:", err);
      return; // Fix: Add return statement for all code paths
    }
  }, [
    animationData,
    path,
    loop,
    autoplay,
    renderer,
    speed,
    onComplete,
    onLoopComplete,
    onEnterFrame,
  ]);

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg w-full h-full" />
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
};

export { LottieAnimation };
export type { LottieAnimationProps };
