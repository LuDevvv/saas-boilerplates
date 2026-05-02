import { FC } from "react";

export const ReportLoadingState: FC = () => {
  return (
    <div className="rounded-[20px] border border-gray-100 bg-white/80 backdrop-blur-md shadow-sm dark:border-white/10 dark:bg-gray-900/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50 dark:border-white/5">
              <th className="px-6 py-4 text-[10px] font-abel uppercase text-gray-400">Nombre del Reporte</th>
              <th className="px-6 py-4 text-[10px] font-abel uppercase text-gray-400">Formato</th>
              <th className="px-6 py-4 text-[10px] font-abel uppercase text-gray-400">Creado el</th>
              <th className="px-6 py-4 text-[10px] font-abel uppercase text-gray-400">Tamaño</th>
              <th className="px-6 py-4 text-[10px] font-abel uppercase text-gray-400">Estado</th>
              <th className="px-6 py-4 text-[10px] font-abel uppercase text-gray-400 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td colSpan={6} className="px-6 py-6 h-16 bg-gray-50/20 dark:bg-white/[0.01]"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};