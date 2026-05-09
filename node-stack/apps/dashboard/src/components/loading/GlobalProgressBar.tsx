import { animate } from "@motionone/dom";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";

import { transition } from "@/lib/motion";

export const GlobalProgressBar = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching > 0 || isMutating > 0;
  
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isLoading) {
      timeout = setTimeout(() => setVisible(true), 200); 
    } else {
      setVisible(false);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  useEffect(() => {
    if (visible && barRef.current) {
      animate(
        barRef.current,
        { width: ["0%", "30%", "70%", "90%"] },
        { ...transition.progress, easing: "linear" }
      );
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] bg-primary/20">
      <div
        ref={barRef}
        className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
      />
    </div>
  );
};
