import { FC, ReactNode, useEffect, useRef } from "react";
import { animate } from "@motionone/dom";

interface AdminPageShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper uniforme para todas las páginas del panel admin.
 * Aplica la misma animación de entrada (slide-up + fade) que usa el LinkTransition
 * del sidebar, dando consistencia visual entre secciones.
 */
export const AdminPageShell: FC<AdminPageShellProps> = ({ children, className = "" }) => {
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
