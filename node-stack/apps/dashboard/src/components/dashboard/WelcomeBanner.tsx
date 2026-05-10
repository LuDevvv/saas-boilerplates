import { FC, useState, useEffect } from "react";

import { cn } from "@/utils/classNames";

// ─── Utils ────────────────────────────────────────────────────────────────────

const PHRASES = [
  "El éxito es la suma de pequeños esfuerzos repetidos día a día.",
  "Cada decisión que tomas hoy construye el negocio de mañana.",
  "La claridad llega cuando prestas atención a los datos, no al ruido.",
  "Pequeños avances consistentes superan grandes saltos esporádicos.",
  "El mejor momento para optimizar fue ayer. El segundo mejor es ahora.",
  "Los negocios que crecen son los que entienden sus números.",
  "Mide todo. Mejora lo que importa.",
  "El foco es el recurso más escaso. Úsalo bien.",
  "Hoy es un buen día para revisar, ajustar y seguir.",
  "El detalle marca la diferencia entre lo bueno y lo excelente.",
  "No necesitas ser perfecto para comenzar. Solo necesitas comenzar.",
  "Un equipo alineado mueve montañas.",
  "La automatización amplifica la intención, no la reemplaza.",
  "Consistencia hoy, resultados mañana.",
  "Lo que se mide, se gestiona. Lo que se gestiona, mejora.",
];

function getDailyPhrase(): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const day = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  return PHRASES[day % PHRASES.length];
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

// ─── Clock ────────────────────────────────────────────────────────────────────

const LiveClock: FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  const date = now.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0 select-none">
      <p className="text-[26px] sm:text-[30px] font-heading font-bold text-fg tabular-nums leading-none">
        {hh}
        <span className="text-gray-200 dark:text-white/15 mx-0.5">:</span>
        {mm}
      </p>
      <p className="text-[10px] text-fg-muted capitalize font-medium">{date}</p>
    </div>
  );
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar: FC<{ firstName: string; lastName?: string; avatarUrl?: string }> = ({
  firstName,
  lastName,
  avatarUrl,
}) => {
  const initials = [firstName[0], lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "U";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={firstName}
        className="h-11 w-11 sm:h-13 sm:w-13 rounded-full object-cover ring-2 ring-[var(--border)] shrink-0"
        style={{ width: 48, height: 48 }}
      />
    );
  }

  return (
    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-surface-hover flex items-center justify-center shrink-0">
      <span className="text-[14px] sm:text-[15px] font-bold text-fg-secondary select-none ">
        {initials}
      </span>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export interface WelcomeBannerProps {
  firstName: string;
  lastName?: string;
  avatarUrl?: string;
  className?: string;
}

export const WelcomeBanner: FC<WelcomeBannerProps> = ({
  firstName,
  lastName,
  avatarUrl,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Avatar */}
      <Avatar firstName={firstName} lastName={lastName} avatarUrl={avatarUrl} />

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] sm:text-[11px] font-semibold text-fg-muted uppercase  leading-none">
          {getGreeting()}
        </p>
        <h2 className="text-[20px] sm:text-[24px] font-heading font-bold text-fg leading-tight mt-1">
          {firstName}
        </h2>
        <p className="hidden sm:block text-[12px] text-fg-muted italic mt-1.5 leading-relaxed line-clamp-1">
          {getDailyPhrase()}
        </p>
      </div>

      {/* Clock */}
      <LiveClock />
    </div>
  );
};
