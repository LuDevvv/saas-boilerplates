import { FC, useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { Button, PageHeader } from "@node-stack/ui";
import { appToast } from "@/components/alerts/Toasts";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useRealtimeStore } from "@/stores/realtimeStore";
import { useUploadFile, type StorageFile } from "@/features/storage";
import { api } from "@/lib/api";
import { useShallow } from "zustand/react/shallow";
import { useQueryClient } from "@tanstack/react-query";
import { useReports, useDeleteReport } from "@/features/reports/hooks/useReports";
import { ReportsFilterBar } from "./ReportsFilterBar";
import { ReportList } from "./ReportList";
import { CreateReportModal } from "./CreateReportModal";

export const ReportsContent: FC = () => {
  const activeWorkspaceId = useWorkspaceStore(useShallow((state) => state.activeWorkspaceId));
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const socket = useRealtimeStore(useShallow((state) => state.socket));
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useReports(activeWorkspaceId);
  const deleteReportMutation = useDeleteReport(activeWorkspaceId);

  useEffect(() => {
    if (!socket) return;

    const handleReportReady = (_data: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ["reports", activeWorkspaceId] });
      appToast.success({ title: "Report Ready", description: "Your report has finished processing." });
    };

    socket.on("report:ready", handleReportReady);

    return () => {
      socket.off("report:ready", handleReportReady);
    };
  }, [socket, activeWorkspaceId, queryClient]);

  const { upload, isUploading } = useUploadFile(activeWorkspaceId || "");

  const openCreateModal = () => {
    setIsModalOpen(true);
  };

  const handleSave = async (formData: { name: string; type: string }) => {
    if (!activeWorkspaceId) {
      appToast.error({ title: "Error", description: "No hay una compañía activa." });
      return;
    }

    const toastId = appToast.loading({ title: "Processing", description: "Generating and saving your report..." });

    try {
      const ext = formData.type.toLowerCase();
      let mime = "application/pdf";
      if (ext === "csv") mime = "text/csv";
      if (ext === "json") mime = "application/json";

      const blob = new Blob([`Simulated report content for ${formData.name}`], { type: mime });
      const file = new File([blob], `${formData.name}.${ext}`, { type: mime });

      await upload(file);
      queryClient.invalidateQueries({ queryKey: ["reports", activeWorkspaceId] });

      appToast.success({ title: "Success", description: "Report generated successfully" }, { id: toastId });
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      appToast.error({ title: "Error", description: "Failed to generate report" }, { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReportMutation.mutateAsync(id);
      appToast.success({ title: "Deleted", description: "Report was removed." });
    } catch (error) {
      appToast.error({ title: "Delete Failed", description: "Could not delete report." });
    }
  };

  const handleDownload = async (report: StorageFile) => {
    try {
      const { downloadUrl } = await api.storage.getDownloadUrl(report.id);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = report.name;
      link.target = "_blank";
      link.click();
    } catch (error) {
      appToast.error({ title: "Download Failed", description: "Could not generate secure download link." });
    }
  };

  const filteredReports = reports.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col gap-8 w-full max-w-[1600px] mx-auto pb-20 px-4 md:px-6 animate-fade-in">
      <PageHeader
        eyebrow="WORKSPACE"
        title="Reportes del Sistema"
        description="Gestiona y genera tus exportaciones de inteligencia de negocio."
        action={
          <Button
            onClick={openCreateModal}
            disabled={isUploading || isLoading}
            className="rounded-xl bg-primary hover:bg-primary-600 px-5 h-11 text-[12px] font-medium text-primary-foreground transition-all shadow-[0_4px_14px_-2px_rgba(0,64,128,0.20)] dark:shadow-[0_4px_14px_-2px_rgba(91,168,229,0.20)] active:scale-95"
          >
            <FileText className="mr-2 h-4 w-4" />
            Nuevo Reporte
          </Button>
        }
      />

      <ReportsFilterBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-heading text-fg leading-none">Archivos Generados</h2>
          <span className="text-[10px] font-bold text-fg-muted uppercase tracking-wider">
            {filteredReports.length} reportes
          </span>
        </div>

        <ReportList
          reports={filteredReports}
          isLoading={isLoading}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onCreateFirst={openCreateModal}
        />
      </section>

      <CreateReportModal
        isOpen={isModalOpen}
        onClose={() => !isUploading && setIsModalOpen(false)}
        onSave={handleSave}
        isLoading={isUploading}
      />
    </div>
  );
};
