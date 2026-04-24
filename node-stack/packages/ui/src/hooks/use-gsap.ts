"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";

/**
 * A custom hook to use GSAP safely with React.
 * It ensures that animations are cleaned up when the component unmounts.
 */
export const useGsap = (
  fn: (ctx: gsap.Context) => void,
  deps: React.DependencyList = []
) => {
  const rootRef = useRef<any>(null);

  // useLayoutEffect to avoid flashes of unstyled content
  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(fn, rootRef);
    return () => ctx.revert(); // Cleanup
  }, deps);

  return rootRef;
};

export { gsap };
