import { FC, useState, useCallback } from "react";
import { HardDrive } from "lucide-react";
import { Button, Card, EmptyState } from "@node-stack/ui";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useStorageFiles, useStorageStats, useUploadFile, useDeleteFile } from "../hooks/useStorage";
import { FileGrid } from "../components/FileGrid";
import { StorageStats } from "../components/StorageStats";
import { FileUploadButton } from "../components/FileUploadButton";
import { api } from "@/lib/api";
import { cn } from "@node-stack/ui/src/utils";

const StoragePage: FC = () => {
  const { activeWorkspaceId } = useWorkspaceStore();

  const { data: filesResponse, isLoading: isLoadingFiles } = useStorageFiles(activeWorkspaceId);
  const files = Array.isArray(filesResponse) ? filesResponse : (filesResponse as any)?.data || [];
  
  const { data: stats, isLoading: isLoadingStats } = useStorageStats(activeWorkspaceId);
  const { upload, isUploading, progress } = useUploadFile(activeWorkspaceId);
  const deleteMutation = useDeleteFile(activeWorkspaceId);

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await upload(file);
    }
  }, [upload]);

  const handleDownload = async (file: any) => {
    try {
      const { downloadUrl } = await api.storage.getDownloadUrl(file.id);
      window.open(downloadUrl, "_blank");
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div 
      className={cn(
        "space-y-10 pb-20 animate-in fade-in duration-700 min-h-[calc(100vh-100px)] rounded-3xl transition-colors duration-300",
        isDragging ? "bg-primary/5 border-2 border-dashed border-primary" : "border-2 border-transparent"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={cn("transition-opacity duration-300", isDragging ? "opacity-50 pointer-events-none" : "opacity-100")}>
        <SectionHeader
          title="Media Manager"
          subtitle="Gestiona tus assets, arrastra archivos para subirlos."
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
                description="Sube tu primer archivo o arrástralo aquí para empezar a gestionar tus recursos."
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

      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <HardDrive className="w-10 h-10 text-primary animate-bounce" />
            </div>
            <h3 className="text-xl font-heading text-fg">Suelta el archivo aquí</h3>
            <p className="text-sm text-slate-500">Subiremos el asset inmediatamente.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoragePage;
