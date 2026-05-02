import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/classNames";

interface LinkTransitionProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  callBack?: () => void;
}

// Función de guarda de tipo para verificar si startViewTransition está disponible
function supportsViewTransition(doc: Document): doc is Document & {
  startViewTransition: (callback: () => void | Promise<void>) => any;
} {
  return "startViewTransition" in doc;
}

export const LinkTransition: FC<LinkTransitionProps> = ({
  href,
  className = "",
  children,
  callBack = () => { },
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    callBack();

    if (!href) {
      console.warn("LinkTransition: href is missing, skipping navigation");
      return;
    }

    // Usamos la guarda de tipo para verificar la disponibilidad
    if (supportsViewTransition(document)) {
      document.startViewTransition(() => {
        navigate(href);
        window.scrollTo(0, 0);
      });
    } else {
      navigate(href);
      window.scrollTo(0, 0);
    }
  };

  return (
    <button type="button" onClick={handleClick} className={cn("outline-none focus:outline-none focus-visible:outline-none", className)}>
      {children}
    </button>
  );
};

export default LinkTransition;
