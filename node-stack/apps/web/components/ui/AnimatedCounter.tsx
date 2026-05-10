"use client";

import { useEffect, useRef } from "react";
import { inView } from "@motionone/dom";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

// easeOutExpo
function easeOut(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 1800,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.textContent = prefix + "0" + suffix;

    const stopInView = inView(
      el,
      () => {
        if (triggered.current) return;
        triggered.current = true;

        const startTime = performance.now();

        const tick = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = easeOut(progress);
          const current = Math.round(eased * value);
          if (el) el.textContent = prefix + current.toLocaleString() + suffix;
          if (progress < 1) {
            rafRef.current = requestAnimationFrame(tick);
          }
        };

        rafRef.current = requestAnimationFrame(tick);
      },
      { margin: "-40px 0px" }
    );

    return () => {
      if (typeof stopInView === "function") stopInView();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, suffix, prefix, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
