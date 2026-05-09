import { PremiumLoader } from "@node-stack/ui";
import { type FC, useState, useEffect } from "react";

const RENDER_DELAY_MS = 150;

const Loading: FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), RENDER_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-canvas transition-colors duration-500">
      <PremiumLoader
        logoSrc="/logo-sinfondo.png"
      />
    </div>
  );
};

export default Loading;
