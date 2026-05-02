import { FC, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, X } from "lucide-react";
import { cn } from "@/utils/classNames";

export const SupportCard: FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className={cn(
            "group relative rounded-[20px] border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-gray-900"
          )}
        >
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>

          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5">
              <Headphones className="h-4 w-4 text-gray-900 dark:text-white" />
            </div>
            <h4 className="text-xs font-heading text-gray-900 dark:text-white">Need support</h4>
          </div>

          <p className="mb-3 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed text-left">
            Contact with one of our expert to get support.
          </p>

          <button className="w-full rounded-xl bg-gray-50 py-2.5 text-xs font-heading text-gray-900 transition-all hover:bg-gray-100 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 active:scale-95">
            Cal the expert
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
