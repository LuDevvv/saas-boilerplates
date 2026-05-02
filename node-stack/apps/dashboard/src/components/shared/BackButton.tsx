import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/classNames";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ to, label = "Volver", className }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={cn(
        "group flex items-center gap-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300",
        className
      )}
    >
      <div className="w-7 h-7 rounded-lg bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-[#004080] group-hover:border-[#004080] group-hover:text-[#004080] dark:group-hover:text-white transition-all">
        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
      </div>
      <span className="text-[11px] font-label uppercase">
        {label}
      </span>
    </button>
  );
};
