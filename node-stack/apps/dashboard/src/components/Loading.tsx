import { Loader2 } from "lucide-react";
import type { FC } from "react";

const Loading: FC = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative">
          <Loader2 className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 text-primary-500 animate-spin" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
