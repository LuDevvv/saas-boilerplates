"use client";

import { useGsapReveal } from "@node-stack/ui";

interface MotionSectionProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
}

export function MotionSection({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.5,
}: MotionSectionProps) {
  const ref = useGsapReveal<HTMLDivElement>({ direction, delay, duration });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
