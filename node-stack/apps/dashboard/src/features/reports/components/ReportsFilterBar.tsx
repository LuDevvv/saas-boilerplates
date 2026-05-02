import { FC } from "react";
import { Search, Filter, Calendar } from "lucide-react";

interface ReportsFilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const ReportsFilterBar: FC<ReportsFilterBarProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="relative flex-1 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar reportes por nombre..."
          className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-md dark:bg-gray-900/50 border border-gray-100 dark:border-white/10 rounded-[20px] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm"
        />
      </div>
      <div className="flex gap-4">
        <button className="flex items-center gap-2 px-6 py-4 bg-white/80 backdrop-blur-md dark:bg-gray-900/50 border border-gray-100 dark:border-white/10 rounded-[20px] text-[11px] font-abel uppercase text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:shadow-md transition-all active:scale-95">
          <Calendar className="h-4 w-4" />
          Rango de Fecha
        </button>
        <button className="flex items-center gap-2 px-6 py-4 bg-white/80 backdrop-blur-md dark:bg-gray-900/50 border border-gray-100 dark:border-white/10 rounded-[20px] text-[11px] font-abel uppercase text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:shadow-md transition-all active:scale-95">
          <Filter className="h-4 w-4" />
          Filtros
        </button>
      </div>
    </div>
  );
};