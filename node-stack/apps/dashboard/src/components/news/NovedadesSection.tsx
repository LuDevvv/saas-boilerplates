import { FC } from "react";
import { Zap, Rocket, Bug } from "lucide-react";
import { cn } from "@/utils/classNames";

export interface ReleaseNote {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  type: "feature" | "fix" | "improvement";
}

const TYPE_CONFIG = {
  feature: {
    icon: Rocket,
    label: "Nuevo",
    color: "text-primary bg-primary/5 dark:bg-primary/10 dark:text-primary-light",
  },
  fix: {
    icon: Bug,
    label: "Fix",
    color: "text-slate-600 bg-slate-50 dark:bg-white/5 dark:text-gray-400",
  },
  improvement: {
    icon: Zap,
    label: "Mejora",
    color: "text-primary-700 bg-primary/5 dark:bg-primary/10 dark:text-primary-light",
  },
};

export const NovedadesSection: FC<{ notes: ReleaseNote[] }> = ({ notes }) => {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-label text-gray-950 dark:text-white uppercase text-[11px]">Novedades</h2>
        <button className="text-[10px] font-label uppercase text-primary hover:text-primary-light transition-colors active:scale-95">
          Ver Historial
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {notes.map((note) => {
          const config = TYPE_CONFIG[note.type];
          const Icon = config.icon;
          
          return (
            <div 
              key={note.id}
              className="group relative flex items-start gap-4 rounded-3xl border border-border bg-surface p-5 transition-all duration-500 hover:shadow-md active:scale-[0.98]"
            >
              <div className={cn("rounded-2xl p-3 flex-shrink-0 transition-all duration-500 shadow-sm", config.color)}>
                <Icon className="h-5 w-5" />
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={cn("text-[9px] font-label uppercase px-2 py-0.5 rounded-full border border-current/10 shadow-sm", config.color)}>
                    {config.label}
                  </span>
                  <span className="text-[10px] font-label text-gray-400 dark:text-gray-500 uppercase">{note.date}</span>
                </div>
                <h3 className="text-[15px] font-heading text-gray-950 dark:text-white leading-tight">{note.title}</h3>
                <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2 font-label">{note.description}</p>              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
