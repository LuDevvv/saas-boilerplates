"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

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
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Premium Mask Reveal for Logo
      gsap.fromTo(
        logoRef.current,
        { y: 80, scale: 0.95 },
        {
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "expo.out",
          force3D: true, // Hardware acceleration
        }
      );

      // 3. Snappy Progress Line
      const tlBar = gsap.timeline({ repeat: -1 });

      tlBar.fromTo(
        barRef.current,
        { scaleX: 0, transformOrigin: "left" },
        { scaleX: 1, duration: 1, ease: "power3.inOut", force3D: true }
      )
        .to(
          barRef.current,
          { scaleX: 0, transformOrigin: "right", duration: 1, ease: "power3.inOut", force3D: true },
          "+=0.2" // tiny pause before shrinking
        );

    }, containerRef);

    return () => ctx.revert();
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
          // Removed drop-shadow as it's the #1 cause of CSS rendering lag when animating transforms
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
