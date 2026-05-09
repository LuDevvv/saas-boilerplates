import { Search } from "lucide-react";

interface TicketSearchProps {
  value?: string;
  onChange?: (v: string) => void;
}

export const TicketSearch = ({ value = "", onChange }: TicketSearchProps) => (
  <div className="relative w-full md:w-72 group">
    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted group-focus-within:text-primary transition-colors" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder="Buscar tickets por ID o asunto..."
      className="w-full pl-10 pr-3.5 h-10 bg-surface-muted border border-border rounded-xl text-[13px] text-fg placeholder:text-fg-muted focus:outline-none focus:border-primary transition-colors"
    />
  </div>
);
