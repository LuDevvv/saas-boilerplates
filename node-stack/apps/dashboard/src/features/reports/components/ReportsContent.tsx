import { FC, useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { Button } from "@node-stack/ui";
import { appToast } from "@/components/alerts/Toasts";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useRealtimeStore } from "@/stores/realtimeStore";
import { useUploadFile, storageApi, type StorageFile } from "@/features/storage";
import { useShallow } from "zustand/react/shallow";
import { useQueryClient } from "@tanstack/react-query";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useReports, useDeleteReport } from "@/features/reports/hooks/useReports";
import { ReportsFilterBar } from "./ReportsFilterBar";
import { ReportList } from "./ReportList";
import { CreateReportModal } from "./CreateReportModal";

export const ReportsContent: FC = () => {
  const activeWorkspaceId = useWorkspaceStore(useShallow((state) => state.activeWorkspaceId));
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "PDF" });

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
    setFormData({ name: "", type: "PDF" });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      appToast.error({ title: "Validation Error", description: "Report name is required" });
      return;
    }

    if (!activeWorkspaceId) {
      appToast.error({ title: "Error", description: "No active workspace" });
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
      const { downloadUrl } = await storageApi.getDownloadUrl(report.id);
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
    <div className="flex flex-1 flex-col gap-10 w-full max-w-[1600px] mx-auto pb-20 px-4 md:px-6 animate-fade-in">
      <SectionHeader
        title="Reportes del Sistema"
        subtitle="Gestiona y genera tus exportaciones de inteligencia de negocio."
        action={
          <Button
            onClick={openCreateModal}
            disabled={isUploading || isLoading}
            className="rounded-2xl bg-primary hover:bg-primary-600 px-6 h-11 text-[10px] font-heading uppercase text-white shadow-xl shadow-blue-900/20 transition-all active:scale-95"
          >
            <FileText className="mr-2 h-4 w-4" />
            Nuevo Reporte
          </Button>
        }
      />

      <ReportsFilterBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-heading text-gray-900 dark:text-white leading-none">Archivos Generados</h2>
          <span className="text-[10px] font-label text-gray-400 uppercase">{filteredReports.length} REPORTES</span>
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
        formData={formData}
        onFormChange={setFormData}
        isLoading={isUploading}
      />
    </div>
  );
};
