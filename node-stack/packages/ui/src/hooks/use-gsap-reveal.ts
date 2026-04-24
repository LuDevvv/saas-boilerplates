"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Hook to create a reveal animation on scroll using GSAP ScrollTrigger.
 */
export const useGsapReveal = (options: {
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  distance?: number;
} = {}) => {
  const elementRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    const {
      direction = "up",
      delay = 0,
      duration = 1,
      distance = 50,
    } = options;

    const element = elementRef.current;
    if (!element) return;

    // Initial state
    const vars: gsap.TweenVars = {
      opacity: 0,
      duration,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%", // Starts when top of element is 85% from top of viewport
        toggleActions: "play none none reverse",
      },
    };

    if (direction === "up") vars.y = distance;
    if (direction === "down") vars.y = -distance;
    if (direction === "left") vars.x = distance;
    if (direction === "right") vars.x = -distance;

    const anim = gsap.from(element, vars);

    return () => {
      anim.kill();
      if (ScrollTrigger.getById(element)) {
        ScrollTrigger.getById(element)?.kill();
      }
    };
  }, [options.direction, options.delay, options.duration, options.distance]);

  return elementRef;
};
