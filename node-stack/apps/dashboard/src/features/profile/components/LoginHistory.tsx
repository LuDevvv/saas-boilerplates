import { FC } from "react";
import { Smartphone, Clock, ChevronRight } from "lucide-react";
import { Card } from "@node-stack/ui";
import { SessionHistoryItem } from "../types";

const mockSessions: SessionHistoryItem[] = [
  { id: "1", device: "iPhone 15 Pro", location: "São Paulo, BR", ip: "192.168.1.1", time: "Activo ahora", isActive: true },
  { id: "2", device: "MacBook Pro", location: "São Paulo, BR", ip: "192.168.1.2", time: "Hace 2 horas", isActive: false },
];

export const LoginHistory: FC = () => (
  <Card className="card-premium">
    <div className="flex items-center justify-between px-6 md:px-8 py-5 md:py-6 border-b border-gray-50 dark:border-white/5">
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 text-gray-400" />
        <h2 className="text-lg font-heading text-gray-950 dark:text-white">Inicios de Sesión</h2>
      </div>
      <button className="text-[11px] font-label text-red-500 hover:underline uppercase">Cerrar Sesiones</button>
    </div>
    <div className="divide-y divide-gray-50 dark:divide-white/5">
      {mockSessions.map((session) => (
        <div key={session.id} className="flex items-center justify-between px-6 md:px-8 py-4 md:py-5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-heading text-gray-950 dark:text-white">{session.device} • {session.location}</p>
              <div className="flex items-center gap-1.5 text-[10px] font-label text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{session.time} • {session.ip}</span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300" />
        </div>
      ))}
    </div>
  </Card>
);