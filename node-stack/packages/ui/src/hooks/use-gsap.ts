"use client";

import { animate } from "@motionone/dom";
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

/**
 * A custom hook to run imperative animations safely with React.
 * Replaces the legacy useGsap hook with Motion's animate() API.
 * Ensures animations are cancelled on component unmount.
 */
type CancelableAnimation = { cancel: () => void };

export const useMotionAnimate = (
  fn: (scope: HTMLElement) => CancelableAnimation | CancelableAnimation[] | void,
  deps: React.DependencyList = []
): RefObject<HTMLElement | null> => {
  const rootRef = useRef<HTMLElement | null>(null);

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (!rootRef.current) return;

    const result = fn(rootRef.current);
    const controls = Array.isArray(result) ? result : result ? [result] : [];

    return () => {
      controls.forEach(c => c.cancel());
    };
  }, deps);

  return rootRef;
};

export { animate };
