"use client";

import { animate } from "@motionone/dom";
import React, { useEffect, useRef } from "react";

interface PremiumLoaderProps {
  logoSrc?: string;
  className?: string;
}

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({
  logoSrc = "/logo-sinfondo.png",
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !logoRef.current || !barRef.current) return;

    // Premium Mask Reveal for Logo — hardware-accelerated transform
    const logoAnim = animate(
      logoRef.current,
      { transform: ["translateY(80px) scale(0.95)", "translateY(0px) scale(1)"] },
      {
        duration: 1.2,
        easing: [0.16, 1, 0.3, 1], // expo.out equivalent
      }
    );

    // Snappy Progress Line — infinite loop with WAAPI
    const barEl = barRef.current;
    let cancelled = false;

    const runBarLoop = async (): Promise<void> => {
      while (!cancelled) {
        // Expand from left
        barEl.style.transformOrigin = "left";
        await animate(
          barEl,
          { transform: ["scaleX(0)", "scaleX(1)"] },
          { duration: 1, easing: [0.22, 1, 0.36, 1] } // power3.inOut equivalent
        ).finished;

        if (cancelled) break;

        // Tiny pause
        await new Promise(r => setTimeout(r, 200));
        if (cancelled) break;

        // Shrink from right
        barEl.style.transformOrigin = "right";
        await animate(
          barEl,
          { transform: ["scaleX(1)", "scaleX(0)"] },
          { duration: 1, easing: [0.22, 1, 0.36, 1] }
        ).finished;

        if (cancelled) break;
      }
    };

    runBarLoop();

    return () => {
      cancelled = true;
      logoAnim.cancel();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center justify-center min-h-[200px] w-full ${className}`}
      style={{ willChange: "transform, opacity" }}
    >
      {/* Logo Mask Container */}
      <div className="relative mb-6 flex items-center justify-center overflow-hidden px-4 pt-4 pb-2">
        <img
          ref={logoRef}
          src={logoSrc}
          alt="Elora Logo"
          className="relative w-16 h-16 object-contain z-10"
          style={{ willChange: "transform" }}
        />
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Premium thin progress line with Elora brand colors */}
        <div className="w-24 h-[2px] bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            ref={barRef}
            className="h-full w-full bg-gradient-to-r from-[#00E6E6] via-[#4D94DB] to-[#004080] rounded-full"
            style={{ willChange: "transform" }}
          />
        </div>
      </div>
    </div>
  );
};
