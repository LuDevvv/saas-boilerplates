import { X } from "lucide-react";
import { FC, useState } from "react";

import { cn } from "@/utils/classNames";

export const UpgradeCard: FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-[24px] p-5 text-center shadow-lg transition-all duration-300 hover:shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300",
        "bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] dark:from-[#0A0A0A] dark:to-[#1A1A1A]"
      )}
    >
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-3 text-white/40 hover:text-white/80 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-inner">
           <div className="w-3.5 h-3.5 bg-primary rotate-45" />
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <h4 className="text-[14px] font-heading text-white leading-tight px-1">
          Get started with access reviews for free
        </h4>
      </div>

      <button className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-heading text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-95">
        Try now
      </button>
    </div>
  );
};
