import { FC } from "react";
import { Play, Clock, ChevronRight } from "lucide-react";
import { useVideoDuration } from "@hooks/useVideoDuration";
import { cn } from "@/utils/classNames";

interface VideoCardProps {
  id: number;
  title: string;
  description?: string;
  duration?: string;
  url: string;
  thumbnail: string;
  provider?: string;
  category?: string;
  isHighlighted?: boolean;
  onPlay: (id: number) => void;
}

const DEFAULT_CATEGORY_COLORS = {
  bg: "bg-emerald-50 dark:bg-emerald-500/10",
  text: "text-emerald-600 dark:text-emerald-400",
  dot: "bg-emerald-500",
};

const CATEGORY_COLORS: Record<string, typeof DEFAULT_CATEGORY_COLORS> = {
  Fundamentos: DEFAULT_CATEGORY_COLORS,
  Operación: {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  Marketing: {
    bg: "bg-orange-50 dark:bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  Configuración: {
    bg: "bg-purple-50 dark:bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    dot: "bg-purple-500",
  },
  Ads: {
    bg: "bg-pink-50 dark:bg-pink-500/10",
    text: "text-pink-600 dark:text-pink-400",
    dot: "bg-pink-500",
  },
};

export const VideoCard: FC<VideoCardProps> = ({
  id,
  title,
  description,
  duration: initialDuration,
  url,
  thumbnail,
  provider,
  category,
  onPlay,
}) => {
  const duration =
    initialDuration ||
    useVideoDuration({ url, provider, duration: initialDuration });
  const categoryColors =
    (category && CATEGORY_COLORS[category]) || DEFAULT_CATEGORY_COLORS;

  return (
    <div
      onClick={() => onPlay(id)}
      className="group relative flex flex-col card-premium hover:border-indigo-500/30 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
    >
      {/* Media Section */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Duration Badge */}
        {duration && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/20 text-[10px] font-bold text-white tracking-wide flex items-center gap-1 shadow-lg">
            <Clock className="w-3 h-3" />
            {duration} min
          </div>
        )}

        {/* Play Icon - Simplified animation */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-current ml-1" />
          </div>
        </div>

        {/* Category Badge */}
        {category && (
          <div
            className={cn(
              "absolute top-3 left-3 px-3 py-1 rounded-full border shadow-sm backdrop-blur-md flex items-center gap-2 transition-transform duration-500 group-hover:translate-x-1",
              categoryColors.bg,
              "border-white/20 dark:border-gray-700/50"
            )}
          >
            <span
              className={cn("w-1.5 h-1.5 rounded-full", categoryColors.dot)}
            />
            <span
              className={cn(
                "text-[11px] font-bold uppercase tracking-widest",
                categoryColors.text
              )}
            >
              {category}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors duration-300">
            {title}
          </h3>
          {description && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Footer UI */}
        <div className="mt-6">
          <div className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-indigo-600 text-white text-xs font-bold transition-all duration-300 hover:bg-indigo-700 group/btn">
            Ver lección
            <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
