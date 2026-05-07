import { FC } from "react";
import { Download, Database, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, Button, Skeleton } from "@node-stack/ui";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { usePortabilityRequests, useRequestExport, useDownloadExport } from "../hooks/usePortability";

const PortabilityPage: FC = () => {
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: requests, isLoading } = usePortabilityRequests(activeWorkspaceId);
  const { mutate: requestExport, isPending: isRequesting } = useRequestExport(activeWorkspaceId);
  const { mutate: downloadExport, isPending: isDownloading } = useDownloadExport(activeWorkspaceId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "pending":
      case "processing": return <Clock className="w-5 h-5 text-amber-500 animate-pulse" />;
      case "failed": return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Completado";
      case "pending": return "Pendiente";
      case "processing": return "Procesando";
      case "failed": return "Fallido";
      case "expired": return "Expirado";
      default: return status;
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <SectionHeader
        title="Exportación de Datos"
        subtitle="Cumplimiento GDPR. Solicita un paquete con toda la información de tu compañía."
        action={
          <Button
            onClick={() => requestExport()}
            loading={isRequesting}
            className="rounded-xl bg-primary hover:bg-primary-600 text-white font-heading uppercase text-xs h-11 px-6 shadow-lg transition-all active:scale-[0.98]"
          >
            <Database className="mr-2 h-4 w-4" />
            Solicitar Exportación
          </Button>
        }
      />

      <Card className="p-0 overflow-hidden border-border dark:border-white/5 bg-white dark:bg-canvas-dark shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-muted text-fg-secondary font-label uppercase text-[10px]">
              <tr>
                <th className="px-6 py-4">ID de Solicitud</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : requests?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-label">
                    No hay exportaciones solicitadas.
                  </td>
                </tr>
              ) : (
                requests?.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-300">
                      {req.id.split('-')[0]}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(req.status)}
                        <span className="font-medium text-fg">
                          {getStatusLabel(req.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === "completed" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={isDownloading}
                          onClick={() => downloadExport(req.id)}
                          className="rounded-lg text-xs"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PortabilityPage;
