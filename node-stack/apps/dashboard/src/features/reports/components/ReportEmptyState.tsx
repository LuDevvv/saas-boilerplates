import { FC } from "react";
import { FileText } from "lucide-react";

interface ReportEmptyStateProps {
  onCreateFirst: () => void;
}

export const ReportEmptyState: FC<ReportEmptyStateProps> = ({ onCreateFirst }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
        <FileText className="w-8 h-8 text-gray-300 dark:text-gray-600" />
      </div>
      <h3 className="text-lg font-heading text-gray-900 dark:text-white mb-2">
        No se encontraron reportes
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
        Comienza a generar reportes para exportar tus datos de inteligencia de negocio.
      </p>
      <button
        onClick={onCreateFirst}
        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-heading rounded-2xl transition-all active:scale-95"
      >
        Generar Primer Reporte
      </button>
    </div>
  );
};