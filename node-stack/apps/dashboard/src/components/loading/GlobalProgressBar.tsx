import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

type Phase = "hidden" | "loading" | "done";

export const GlobalProgressBar = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isActive = isFetching > 0 || isMutating > 0;

  const [phase, setPhase] = useState<Phase>("hidden");
  const barRef    = useRef<HTMLDivElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Phase transitions ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isActive) {
      clearTimeout(hideTimer.current);

      if (phase === "hidden") {
        // Delay show slightly so fast requests don't flash the bar
        showTimer.current = setTimeout(() => setPhase("loading"), 150);
      } else if (phase === "done") {
        // New request came in before completion animation finished — restart
        clearTimeout(showTimer.current);
        setPhase("loading");
      }
      // If already "loading", nothing to do
    } else {
      clearTimeout(showTimer.current);

      if (phase === "loading") {
        // Small hold before completing — bridges rapid sequential requests
        hideTimer.current = setTimeout(() => setPhase("done"), 80);
      }
    }

    return () => {
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, [isActive, phase]);

  // ── Bar animations ────────────────────────────────────────────────────────
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;

    if (phase === "loading") {
      bar.style.transition = "none";
      bar.style.opacity    = "1";
      bar.style.width      = "0%";

      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          bar.style.transition = "width 3s cubic-bezier(0.05, 0.65, 0.1, 1.0)";
          bar.style.width      = "80%";
        });
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }

    if (phase === "done") {
      bar.style.transition = "width 0.15s ease-out";
      bar.style.width      = "100%";

      // eslint-disable-next-line prefer-const
      let cleanup2: ReturnType<typeof setTimeout> | undefined;
      const cleanup1 = setTimeout(() => {
        bar.style.transition = "opacity 0.25s ease";
        bar.style.opacity    = "0";
        cleanup2 = setTimeout(() => setPhase("hidden"), 260);
      }, 160);

      return () => {
        clearTimeout(cleanup1);
        if (cleanup2) clearTimeout(cleanup2);
      };
    }

    return undefined;
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none">
      <div
        ref={barRef}
        className="h-full bg-primary"
        style={{
          width: "0%",
          opacity: 1,
          boxShadow: "0 0 8px rgba(0,64,128,0.45), 0 0 2px rgba(0,64,128,0.6)",
          willChange: "width, opacity",
        }}
      />
    </div>
  );
};
