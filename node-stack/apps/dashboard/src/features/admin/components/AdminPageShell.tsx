import { animate } from "@motionone/dom";
import { FC, ReactNode, useEffect, useRef } from "react";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper de entrada para cualquier página.
 * Aplica slide-up + fade en cada montaje — mismo easing que LinkTransition.
 */
export const PageShell: FC<PageShellProps> = ({ children, className = "" }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    animate(el, { opacity: 1, transform: "translateY(0px)" }, { duration: 0.4, easing: [0.22, 1, 0.36, 1] });
  }, []);

  return (
    <div ref={ref} className={className || "w-full"}>
      {children}
    </div>
  );
};

/** @deprecated use PageShell */
export const AdminPageShell = PageShell;
