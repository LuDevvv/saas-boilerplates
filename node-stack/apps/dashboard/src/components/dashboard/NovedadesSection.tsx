import { FC, useState } from "react";
import { Megaphone, Play, Trophy, Rocket, ExternalLink, X } from "lucide-react";
import { LinkTransition } from "@/components/utils/LinkTransition";

// ─── Types ───────────────────────────────────────────────────────────────────

type NewsType = "feature" | "success" | "news" | "update";

interface NewsItem {
  id: string;
  type: NewsType;
  title: string;
  description?: string;
  image: string;
  date: string;
  hasVideo?: boolean;
  videoDuration?: string;
  videoUrl?: string;
  link?: string;
  linkText?: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NewsType, { label: string; icon: FC<{ className?: string }>; gradient: string; textColor: string }> = {
  feature: { label: "Nueva función", icon: Rocket, gradient: "from-[#8C5BFF] to-[#A78BFA]", textColor: "text-primary-600 dark:text-primary-400" },
  success: { label: "Caso de éxito", icon: Trophy, gradient: "from-amber-500 to-orange-500", textColor: "text-amber-600 dark:text-amber-400" },
  news:    { label: "Noticia", icon: Megaphone, gradient: "from-emerald-500 to-teal-500", textColor: "text-emerald-600 dark:text-emerald-400" },
  update:  { label: "Actualización", icon: Rocket, gradient: "from-blue-500 to-indigo-500", textColor: "text-blue-600 dark:text-blue-400" },
};

// ─── Hardcoded Data (replace with API later) ─────────────────────────────────

const NEWS_ITEMS: NewsItem[] = [
  {
    id: "1",
    type: "feature",
    title: "Descripciones con IA",
    description: "Genera descripciones atractivas para tus platillos usando inteligencia artificial. ¡Pruébalo ahora!",
    image: "/images/news/ai-descriptions.png",
    date: "7 mar 2026",
    link: "#",
    linkText: "Explorar",
  },
  {
    id: "2",
    type: "success",
    title: "Taquería Doña Rosa triplicó sus pedidos digitales",
    description: "Descubre cómo esta taquería en CDMX transformó su negocio con un menú digital y códigos QR personalizados.",
    image: "/images/news/success-story.png",
    date: "5 mar 2026",
    hasVideo: true,
    videoDuration: "2:30",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "3",
    type: "news",
    title: "Menús digitales crecen 340% en LATAM",
    description: "El sector restaurantero acelera su digitalización. Los comensales prefieren escanear un QR antes de pedir un menú físico.",
    image: "/images/news/digital-menus.png",
    date: "3 mar 2026",
  },
  {
    id: "4",
    type: "update",
    title: "Nuevo diseño de códigos QR",
    description: "Personaliza tus QR con logos, colores y estilos únicos. Disponible para todos los planes.",
    image: "/images/news/qr-design.png",
    date: "1 mar 2026",
    link: "#",
    linkText: "Ver más",
  },
];

// ─── Card Component ──────────────────────────────────────────────────────────

const NewsCard: FC<{ item: NewsItem; onVideoClick?: (item: NewsItem) => void }> = ({ item, onVideoClick }) => {
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;

  return (
    <div
      className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-[16/10]"
      onClick={() => item.hasVideo && onVideoClick?.(item)}
    >
      <img
        src={item.image}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Video play button */}
      {item.hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 text-primary-600 ml-0.5" />
          </div>
        </div>
      )}

      {/* Type badge - top right */}
      <div className="absolute top-2.5 right-2.5 z-10">
        <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white bg-gradient-to-r ${config.gradient} px-2.5 py-1 rounded-full shadow-md`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      {/* Text overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <h3 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
          {item.title}
        </h3>
      </div>
    </div>
  );
};

// ─── Video Modal ─────────────────────────────────────────────────────────────

const VideoModal: FC<{ item: NewsItem | null; onClose: () => void }> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]" />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl animate-[scale-in_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Video player */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
          <iframe
            src={item.videoUrl}
            title={item.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Title below */}
        <p className="text-sm font-semibold text-white/90 mt-3 text-center">{item.title}</p>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

// ─── Section Component ───────────────────────────────────────────────────────

export const NovedadesSection: FC = () => {
  const [videoItem, setVideoItem] = useState<NewsItem | null>(null);

  return (
    <>
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-5 md:p-6 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8C5BFF] to-[#A78BFA] flex items-center justify-center shadow-sm">
              <Megaphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Novedades</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Lo último de Universal Dashboard</p>
            </div>
          </div>
          <LinkTransition href="/novedades" className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors cursor-pointer flex items-center gap-1 group">
            Ver todas
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </LinkTransition>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {NEWS_ITEMS.map((item) => (
            <NewsCard key={item.id} item={item} onVideoClick={setVideoItem} />
          ))}
        </div>
      </div>
    </div>

    <VideoModal item={videoItem} onClose={() => setVideoItem(null)} />
    </>
  );
};
