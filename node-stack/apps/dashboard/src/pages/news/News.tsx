import { EmptyState as UIEmptyState, PageHeader } from "@node-stack/ui";
import {
  Megaphone,
  Play,
  Trophy,
  Rocket,
  Newspaper,
  Calendar,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { FC, useState, useMemo } from "react";

import { SearchBar } from "@/components/shared/SearchBar";
import { ViewMode } from "@/components/toolbar/ViewToggle";
import NavbarSidebarLayout from "@/layouts/NavBarSideBarLayout";
import { cn } from "@/utils/classNames";

// ─── Types ───────────────────────────────────────────────────────────────────
type NewsType = "feature" | "success" | "news" | "update";

interface NewsItem {
  id: string;
  type: NewsType;
  title: string;
  description: string;
  image: string;
  date: string;
  hasVideo?: boolean;
  videoDuration?: string;
  link?: string;
  linkText?: string;
}

// ─── Config ──────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  NewsType,
  {
    label: string;
    icon: FC<{ className?: string }>;
    textColor: string;
    bgTint: string;
  }
> = {
  feature: {
    label: "Nueva función",
    icon: Rocket,
    textColor: "text-primary",
    bgTint: "bg-primary/10",
  },
  success: {
    label: "Caso de éxito",
    icon: Trophy,
    textColor: "text-amber-600 dark:text-amber-400",
    bgTint: "bg-amber-500/10",
  },
  news: {
    label: "Noticia",
    icon: Newspaper,
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgTint: "bg-emerald-500/10",
  },
  update: {
    label: "Actualización",
    icon: Sparkles,
    textColor: "text-blue-600 dark:text-blue-400",
    bgTint: "bg-blue-500/10",
  },
};

const CATEGORIES = ["Todos", "Nueva función", "Caso de éxito", "Noticia", "Actualización"] as const;

// ─── Hardcoded Data ───────────────────────────────────────────────────────────
const NEWS_ITEMS: NewsItem[] = [
  {
    id: "1",
    type: "feature",
    title: "Descripciones con IA: Genera textos irresistibles",
    description:
      "Genera descripciones atractivas para tus platillos usando inteligencia artificial. Atrae más clientes y aumenta tus ventas con textos optimizados.",
    image: "/images/news/ai-descriptions.png",
    date: "7 mar 2026",
    link: "#",
    linkText: "Explorar",
  },
  {
    id: "2",
    type: "success",
    title: "Taquería Doña Rosa triplicó sus pedidos digitales",
    description:
      "Descubre cómo esta taquería en CDMX transformó su negocio con un menú digital y códigos QR personalizados.",
    image: "/images/news/success-story.png",
    date: "5 mar 2026",
    hasVideo: true,
    videoDuration: "2:30",
  },
  {
    id: "3",
    type: "news",
    title: "Menús digitales crecen 340% en LATAM",
    description:
      "El sector restaurantero acelera su digitalización. Los comensales prefieren escanear un QR antes de pedir un menú físico.",
    image: "/images/news/digital-menus.png",
    date: "3 mar 2026",
  },
  {
    id: "4",
    type: "update",
    title: "Nuevo diseño de códigos QR",
    description:
      "Personaliza tus QR con logos, colores y estilos únicos. Disponible para todos los planes.",
    image: "/images/news/qr-design.png",
    date: "1 mar 2026",
    link: "#",
    linkText: "Ver más",
  },
  {
    id: "5",
    type: "success",
    title: "Hamburguesas 'El Toro' reduce tiempos de espera",
    description:
      "Al implementar pedidos en línea, redujeron significativamente los tiempos de espera y aumentaron la satisfacción del cliente.",
    image: "/images/news/burger-success.png",
    date: "25 feb 2026",
  },
  {
    id: "6",
    type: "feature",
    title: "Nuevas analíticas avanzadas",
    description:
      "Mide qué platos son los más populares, horas pico de escaneos y descubre oportunidades de negocio.",
    image: "/images/news/analytics.png",
    date: "18 feb 2026",
    link: "/analytics",
    linkText: "Ir a analíticas",
  },
];


// ─── Shared: Video Overlay ───────────────────────────────────────────────────
const VideoOverlay: FC<{ hasVideo?: boolean; videoDuration?: string; size?: "sm" | "lg" }> = ({
  hasVideo,
  videoDuration,
  size = "sm",
}) => (
  <>
    {hasVideo && (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className={cn(
          "rounded-full bg-surface-elevated border border-border flex items-center justify-center shadow-[var(--shadow-elevated)] group-hover:scale-110 transition-transform",
          size === "lg" ? "w-16 h-16" : "w-12 h-12"
        )}>
          <Play className={cn("text-primary ml-0.5", size === "lg" ? "w-7 h-7" : "w-5 h-5")} />
        </div>
      </div>
    )}
    {videoDuration && (
      <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/75 backdrop-blur-sm rounded-lg text-[11px] text-white font-label z-10">
        {videoDuration}
      </div>
    )}
  </>
);

// ─── News Card ───────────────────────────────────────────────────────────────
const NewsCard: FC<{ item: NewsItem }> = ({ item }) => {
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;
  return (
    <div className="group flex flex-col bg-surface rounded-[20px] border border-border overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card)] hover:border-border-strong hover:-translate-y-0.5 cursor-pointer h-full">
      <div className="relative w-full aspect-video overflow-hidden bg-surface-muted">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
        <VideoOverlay hasVideo={item.hasVideo} videoDuration={item.videoDuration} />
      </div>
      <div className="flex flex-col gap-2.5 p-4 flex-1">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${config.textColor}`} />
          <span className={`text-[11px] font-label uppercase tracking-wider ${config.textColor}`}>
            {config.label}
          </span>
        </div>
        <h3 className="text-sm font-heading text-fg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-xs text-fg-muted leading-relaxed line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-2.5">
          <span className="text-[10px] text-fg-muted font-label flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {item.date}
          </span>
          {item.link ? (
            <span className={`flex items-center gap-1 text-xs font-label ${config.textColor}`}>
              {item.linkText} <ArrowUpRight className="w-3 h-3" />
            </span>
          ) : (
            <span className="text-xs font-label text-fg-muted group-hover:text-primary transition-colors">
              Leer más
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Empty State ─────────────────────────────────────────────────────────────
const EmptyState: FC = () => (
  <UIEmptyState
    icon={Megaphone}
    title="No se encontraron novedades"
    description="Intenta buscar con otro término o selecciona una categoría diferente."
  />
);

// ─── Page ────────────────────────────────────────────────────────────────────
const NewsPage: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filteredItems = useMemo(() => {
    return NEWS_ITEMS.filter((item) => {
      if (activeCategory !== "Todos") {
        const config = TYPE_CONFIG[item.type];
        if (config.label !== activeCategory) return false;
      }
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [searchTerm, activeCategory]);

  return (
    <NavbarSidebarLayout>
      <div className="flex flex-col gap-6 min-h-full overflow-x-hidden w-full max-w-full animate-fade-in-up">
        <PageHeader
          eyebrow="NOVEDADES"
          title="Centro de Noticias"
          description="Mantente al día con las últimas actualizaciones y novedades."
        />

        <div className="w-full">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onClear={() => setSearchTerm("")}
            placeholder="Buscar novedades..."
            tags={CATEGORIES.map((cat) => ({ id: cat, label: cat }))}
            activeTagId={activeCategory}
            onTagChange={(id) => setActiveCategory(id)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {filteredItems.length > 0 ? (
          <div
            className={cn(
              "grid gap-4 pb-6 w-full max-w-full",
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            )}
          >
            {filteredItems.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </NavbarSidebarLayout>
  );
};

export default NewsPage;
