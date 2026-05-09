import { animate, AnimationOptionsWithOverrides } from "@motionone/dom";
import { FC, useEffect, useRef, PropsWithChildren } from "react";

interface MotionContainerProps {
  delay?: number;
  duration?: number;
  className?: string;
  variant?: "fade" | "slide-up" | "slide-down" | "scale";
}

export const MotionContainer: FC<PropsWithChildren<MotionContainerProps>> = ({
  children,
  delay = 0,
  duration = 0.5,
  className = "",
  variant = "fade",
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const options: AnimationOptionsWithOverrides = {
      delay,
      duration,
      easing: [0.22, 1, 0.36, 1],
    };

    let initial: { opacity: number; transform?: string } = { opacity: 0 };
    let animateTo: { opacity: number; transform?: string } = { opacity: 1 };

    switch (variant) {
      case "slide-up":
        initial = { ...initial, transform: "translateY(20px)" };
        animateTo = { ...animateTo, transform: "translateY(0px)" };
        break;
      case "slide-down":
        initial = { ...initial, transform: "translateY(-20px)" };
        animateTo = { ...animateTo, transform: "translateY(0px)" };
        break;
      case "scale":
        initial = { ...initial, transform: "scale(0.95)" };
        animateTo = { ...animateTo, transform: "scale(1)" };
        break;
    }

    // Set initial state
    Object.assign(ref.current.style, {
      opacity: initial.opacity.toString(),
      transform: initial.transform,
    });

    // Animate
    animate(ref.current, animateTo, options);
  }, [variant, delay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
