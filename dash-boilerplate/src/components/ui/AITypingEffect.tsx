import { FC, useEffect, useState } from "react";

interface AITypingEffectProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "gray" | "gradient" | "white";
  speed?: "slow" | "normal" | "fast";
}

export const AITypingEffect: FC<AITypingEffectProps> = ({
  size = "sm",
  color = "blue",
  speed = "normal",
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
      className={`
        flex items-center gap-1.5 px-1 
        transition-opacity duration-500 
        ${visible ? "opacity-100" : "opacity-70"}
      `}
    >
      {Array.from({ length: dots }).map((_, i) => (
        <div
          key={i}
          className={`
            rounded-full ${sizeClasses[size]} animate-pulse
            transform transition-transform duration-300
          `}
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
