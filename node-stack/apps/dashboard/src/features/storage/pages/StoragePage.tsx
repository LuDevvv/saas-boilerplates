import { FC } from "react";
import { HardDrive } from "lucide-react";
import { Button, Card, EmptyState } from "@node-stack/ui";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useStorageFiles, useStorageStats, useUploadFile, useDeleteFile } from "../hooks/useStorage";
import { FileGrid } from "../components/FileGrid";
import { StorageStats } from "../components/StorageStats";
import { FileUploadButton } from "../components/FileUploadButton";
import { storageApi } from "../api/storage.api";

const StoragePage: FC = () => {
  const { activeWorkspaceId } = useWorkspaceStore();

  const { data: files, isLoading: isLoadingFiles } = useStorageFiles(activeWorkspaceId);
  const { data: stats, isLoading: isLoadingStats } = useStorageStats(activeWorkspaceId);
  const { upload, isUploading, progress } = useUploadFile(activeWorkspaceId);
  const deleteMutation = useDeleteFile(activeWorkspaceId);

  const handleDownload = async (file: any) => {
    try {
      const { downloadUrl } = await storageApi.getDownloadUrl(file.id);
      window.open(downloadUrl, "_blank");
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <SectionHeader
        title="Almacenamiento de Archivos"
        subtitle="Gestiona tus assets, documentos y recursos multimedia."
        action={
          <FileUploadButton 
            onUpload={upload} 
            isUploading={isUploading} 
            progress={progress} 
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!isLoadingFiles && files?.length === 0 ? (
            <EmptyState
              title="Sin archivos"
              description="Sube tu primer archivo para empezar a gestionar tus recursos."
              icon={HardDrive}
              action={<FileUploadButton onUpload={upload} isUploading={isUploading} progress={progress} />}
            />
          ) : (
            <FileGrid
              files={files || []}
              isLoading={isLoadingFiles}
              onDelete={(id) => deleteMutation.mutate(id)}
              onDownload={handleDownload}
            />
          )}
        </div>

        <div className="space-y-8">
          <StorageStats
            usedBytes={stats?.usedBytes || 0}
            totalBytes={stats?.totalBytes || 1024 * 1024 * 1024 * 5} // 5GB default if missing
            fileCount={stats?.fileCount || 0}
            isLoading={isLoadingStats}
          />

          <Card className="p-8 rounded-[32px] border-none bg-slate-900 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            <h4 className="text-sm font-heading uppercase mb-2 relative z-10">Optimización de Assets</h4>
            <p className="text-[11px] text-white/70 leading-relaxed mb-6 relative z-10">
              Nuestra IA puede comprimir tus imágenes automáticamente para ahorrar hasta un 40% de espacio sin pérdida de calidad.
            </p>
            <Button
              variant="ghost"
              className="w-full rounded-xl bg-white/10 text-white hover:bg-white/20 text-[10px] font-heading uppercase relative z-10"
              disabled
            >
              Próximamente
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StoragePage;
