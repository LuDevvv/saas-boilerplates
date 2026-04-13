import { LottieAnimation } from "@/components/lottie/LottieAnimation";
import GenericLoader from "@assets/animations/generic-loader.json";
import type { FC } from "react";

const Loading: FC = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-950">
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative">
          <LottieAnimation
            animationData={GenericLoader}
            className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64"
            loop={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Loading;
