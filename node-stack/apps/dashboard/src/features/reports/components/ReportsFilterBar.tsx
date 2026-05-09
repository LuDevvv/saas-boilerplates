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
    <div className="flex flex-col lg:flex-row gap-3">
      <div className="relative flex-1 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted group-focus-within:text-primary transition-colors w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar reportes por nombre..."
          className="w-full pl-12 pr-4 py-3 bg-surface-muted border border-border rounded-xl focus:outline-none focus:border-primary transition-colors text-sm text-fg placeholder:text-fg-muted"
        />
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-5 py-3 bg-surface border border-border rounded-xl text-[12px] font-medium text-fg-secondary hover:bg-surface-hover hover:text-fg hover:border-border-strong transition-all active:scale-95">
          <Calendar className="h-4 w-4" />
          Rango de fecha
        </button>
        <button className="flex items-center gap-2 px-5 py-3 bg-surface border border-border rounded-xl text-[12px] font-medium text-fg-secondary hover:bg-surface-hover hover:text-fg hover:border-border-strong transition-all active:scale-95">
          <Filter className="h-4 w-4" />
          Filtros
        </button>
      </div>
    </div>
  );
};
