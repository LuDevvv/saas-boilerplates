"use client";

import React, { FC, useEffect, useState } from "react";
import { cn } from "../../utils.js";

export interface AITypingEffectProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "gray" | "gradient" | "white";
  speed?: "slow" | "normal" | "fast";
  className?: string;
}

export const AITypingEffect: FC<AITypingEffectProps> = ({
  size = "sm",
  color = "blue",
  speed = "normal",
  className,
}) => {
  const dots = 3;
  const [visible, setVisible] = useState(true);

  // Add a subtle fade in/out effect
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((prev) => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  };

  const speedMultiplier = {
    slow: 1.5,
    normal: 1,
    fast: 0.7,
  };

  const baseDelay = 0.2 * speedMultiplier[speed];
  const animationDelays = Array.from(
    { length: dots },
    (_, i) => `${baseDelay * i}s`
  );

  // Define the color for each dot
  const getColor = (index: number) => {
    if (color === "gradient") {
      // Create a gradient effect across the dots
      const gradientColors = ["#3B82F6", "#60A5FA", "#0EA5E9"];
      return gradientColors[index % gradientColors.length];
    }
    if (color === "white") return "#FFFFFF";
    return color === "blue" ? "#3B82F6" : "#6B7280";
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-1 transition-opacity duration-500",
        visible ? "opacity-100" : "opacity-70",
        className
      )}
    >
      {Array.from({ length: dots }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-pulse transform transition-transform duration-300",
            sizeClasses[size]
          )}
          style={{
            animationDelay: animationDelays[i],
            animationDuration: `${0.8 * speedMultiplier[speed]}s`,
            background: getColor(i),
          }}
        />
      ))}
    </div>
  );
};
