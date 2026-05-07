import { Search } from "lucide-react";

export const TicketSearch = () => (
  <div className="relative w-full md:w-72 group">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
    <input
      type="text"
      placeholder="Buscar tickets por ID o asunto..."
      className="w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-md dark:bg-gray-900/50 border border-border rounded-[20px] text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
    />
  </div>
);