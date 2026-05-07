"use client";

import { useEffect, useRef, type RefObject } from "react";
import { animate, inView } from "@motionone/dom";

/**
 * Hook to create a reveal animation on scroll using Motion's inView API.
 * Replaces the legacy useGsapReveal hook with WAAPI-backed animations.
 */
export const useGsapReveal = <T extends HTMLElement = HTMLElement>(options: {
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  distance?: number;
} = {}): RefObject<T | null> => {
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const {
      direction = "up",
      delay = 0,
      duration = 1,
      distance = 50,
    } = options;

    const element = elementRef.current;
    if (!element) return;

    // Build initial offset
    const from: Record<string, number> = {};
    if (direction === "up") from.y = distance;
    if (direction === "down") from.y = -distance;
    if (direction === "left") from.x = distance;
    if (direction === "right") from.x = -distance;

    // Apply initial state instantly
    element.style.opacity = "0";
    if (from.y !== undefined) element.style.transform = `translateY(${from.y}px)`;
    if (from.x !== undefined) element.style.transform = `translateX(${from.x}px)`;

    // Use inView to trigger animation when element enters viewport
    const cleanup = inView(element, () => {
      const controls = animate(
        element,
        { opacity: 1, x: 0, y: 0 },
        {
          duration,
          delay,
          easing: [0.16, 1, 0.3, 1], // power3.out equivalent
        }
      );

      return () => controls.cancel();
    }, { margin: "0px 0px -15% 0px" });

    return cleanup;
  }, [options.direction, options.delay, options.duration, options.distance]);

  return elementRef;
};
