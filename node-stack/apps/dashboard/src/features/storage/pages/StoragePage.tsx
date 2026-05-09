import {
  CalloutCard,
  EmptyState,
  FilterTabs,
  Input,
  PageHeader,
  TwoColumnLayout,
} from "@node-stack/ui";
import {
  HardDrive,
  Upload,
  Sparkles,
  Image as ImageIcon,
  FileText,
  Layers,
  Search,
} from "lucide-react";
import { FC, useState, useCallback, useMemo, useRef } from "react";


import { FileGrid } from "../components/FileGrid";
import { FileUploadButton } from "../components/FileUploadButton";
import { StorageStats } from "../components/StorageStats";
import { UploadTray } from "../components/UploadTray";
import {
  useStorageFiles,
  useStorageStats,
  useUploadFile,
  useDeleteFile,
} from "../hooks/useStorage";

import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { cn } from "@/utils/classNames";

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FileFilter = "all" | "images" | "documents";

const FILTERS: { value: FileFilter; label: string; icon: typeof Layers }[] = [
  { value: "all",       label: "Todos",      icon: Layers },
  { value: "images",    label: "Imágenes",   icon: ImageIcon },
  { value: "documents", label: "Documentos", icon: FileText },
];

const matchesFilter = (mime: string, filter: FileFilter) => {
  if (filter === "all") return true;
  if (filter === "images") return mime.startsWith("image/");
  if (filter === "documents") {
    return (
      mime.includes("pdf") ||
      mime.includes("text") ||
      mime.includes("document") ||
      mime.includes("spreadsheet")
    );
  }
  return true;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const StoragePage: FC = () => {
  const { activeWorkspaceId } = useWorkspaceStore();

  const { data: filesResponse, isLoading: isLoadingFiles } = useStorageFiles(activeWorkspaceId);
  const allFiles = Array.isArray(filesResponse)
    ? filesResponse
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : (filesResponse as any)?.data || [];

  const { data: stats, isLoading: isLoadingStats } = useStorageStats(activeWorkspaceId);
  const { upload, isUploading } = useUploadFile(activeWorkspaceId);
  const deleteMutation = useDeleteFile(activeWorkspaceId);

  // ── Local UI state ────────────────────────────────────────────────────────
  const [filter, setFilter] = useState<FileFilter>("all");
  const [search, setSearch] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Dedicated input for the dropzone (avoids racing with the FileUploadButton)
  const dropzoneInputRef = useRef<HTMLInputElement>(null);

  // ── Derived: filtered + searched files ────────────────────────────────────
  const visibleFiles = useMemo(() => {
    const q = search.trim().toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return allFiles.filter((f: any) => {
      if (!matchesFilter(f.type ?? "", filter)) return false;
      if (q && !f.name?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allFiles, filter, search]);

  // ── Multi-file upload helper ──────────────────────────────────────────────
  const uploadMany = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      // Each upload is tracked individually in the global tray store.
      await Promise.allSettled(files.map((f) => upload(f)));
    },
    [upload]
  );

  // ── Drag & drop handlers ──────────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
      if (files.length > 0) await uploadMany(files);
    },
    [uploadMany]
  );

  const handleDropzoneFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    // Reset BEFORE uploading so the same file can be re-selected if it failed.
    if (dropzoneInputRef.current) dropzoneInputRef.current.value = "";
    if (files.length > 0) await uploadMany(files);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDownload = async (file: any) => {
    try {
      const { downloadUrl } = await api.storage.getDownloadUrl(file.id);
      window.open(downloadUrl, "_blank");
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="pb-20 animate-in fade-in duration-500">
      <PageHeader
        eyebrow="WORKSPACE"
        title="Almacenamiento"
        description="Sube, organiza y comparte archivos del workspace. El progreso aparece en la bandeja inferior."
        action={
          <FileUploadButton
            onUpload={upload}
            isUploading={isUploading}
            multiple
          />
        }
        className="mb-6"
      />

      {/* Drag & drop dropzone — uses its own hidden <input> for clicks */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => dropzoneInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            dropzoneInputRef.current?.click();
          }
        }}
        className={cn(
          "w-full rounded-[20px] border-2 border-dashed transition-all duration-200 mb-6",
          "flex flex-col sm:flex-row items-center justify-center gap-4 px-6 py-7 text-left",
          "cursor-pointer focus-visible:outline-none focus-visible:border-primary",
          isDragging
            ? "border-primary bg-primary/[0.06]"
            : "border-border bg-surface-muted hover:border-border-strong hover:bg-surface-hover"
        )}
      >
        <input
          ref={dropzoneInputRef}
          type="file"
          multiple
          onChange={handleDropzoneFileChange}
          className="hidden"
        />

        <div
          className={cn(
            "h-12 w-12 rounded-[14px] flex items-center justify-center shrink-0 transition-colors",
            isDragging ? "bg-primary/15" : "bg-primary/10"
          )}
        >
          <Upload
            className={cn(
              "h-6 w-6 transition-transform duration-200 text-primary",
              isDragging && "scale-110"
            )}
          />
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <p className="text-[14px] font-semibold text-fg leading-snug">
            {isDragging ? "Suelta los archivos aquí" : "Arrastra archivos para subir"}
          </p>
          <p className="text-[12px] text-fg-muted mt-0.5">
            o haz click para seleccionar — soporta múltiples archivos hasta 50 MB
          </p>
        </div>
      </div>

      {/* Two-column layout: file grid + sidebar */}
      <TwoColumnLayout>
        <TwoColumnLayout.Main className="flex flex-col gap-5">
          {/* Toolbar: filters + search */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <FilterTabs
              value={filter}
              onChange={(v) => setFilter(v as FileFilter)}
              ariaLabel="Filtrar archivos por tipo"
              options={FILTERS.map(({ value, label, icon: Icon }) => ({
                value,
                label,
                icon: <Icon className="h-3.5 w-3.5" />,
              }))}
            />

            <div className="sm:w-[260px]">
              <Input
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar archivos..."
                className="h-10 rounded-xl text-[13px]"
              />
            </div>
          </div>

          {/* Result count */}
          {!isLoadingFiles && visibleFiles.length > 0 && (
            <p className="text-[11px] text-fg-muted">
              {visibleFiles.length} {visibleFiles.length === 1 ? "archivo" : "archivos"}
              {filter !== "all" && (
                <>
                  {" "}
                  en{" "}
                  <span className="text-fg-secondary">
                    {FILTERS.find((f) => f.value === filter)?.label.toLowerCase()}
                  </span>
                </>
              )}
            </p>
          )}

          {/* File grid */}
          {!isLoadingFiles && visibleFiles.length === 0 ? (
            search || filter !== "all" ? (
              <EmptyState
                title="Sin resultados"
                description="No encontramos archivos que coincidan con tus filtros. Prueba con otros términos."
                icon={Search}
              />
            ) : (
              <EmptyState
                title="Sin archivos aún"
                description="Sube tu primer archivo arrastrándolo arriba o usando el botón de la cabecera."
                icon={HardDrive}
                action={
                  <FileUploadButton
                    onUpload={upload}
                    isUploading={isUploading}
                    multiple
                  />
                }
              />
            )
          ) : (
            <FileGrid
              files={visibleFiles}
              isLoading={isLoadingFiles}
              onDelete={(id) => deleteMutation.mutate(id)}
              onDownload={handleDownload}
            />
          )}
        </TwoColumnLayout.Main>

        <TwoColumnLayout.Aside className="flex flex-col gap-5">
          <StorageStats
            usedBytes={stats?.usedBytes ?? 0}
            totalBytes={stats?.totalBytes ?? 5 * 1024 * 1024 * 1024}
            fileCount={stats?.fileCount ?? allFiles.length}
            isLoading={isLoadingStats}
          />

          <CalloutCard
            icon={Sparkles}
            variant="promo"
            eyebrow="Próximamente"
            title="Optimización IA"
            description="Comprime imágenes automáticamente sin pérdida de calidad y ahorra hasta un 40% de espacio."
            action={
              <button
                type="button"
                disabled
                className="w-full h-9 rounded-[10px] bg-white/10 hover:bg-white/15 border border-white/15 text-white text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                En beta
              </button>
            }
          />
        </TwoColumnLayout.Aside>
      </TwoColumnLayout>

      {/* Floating upload tray — global state, persists across renders */}
      <UploadTray />
    </div>
  );
};

export default StoragePage;
