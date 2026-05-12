import type { FileInfo as StorageFile } from "@node-stack/types";
import {
  Button,
  Skeleton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@node-stack/ui";
import {
  FileText,
  Image as ImageIcon,
  FileJson,
  FileCode,
  MoreVertical,
  Download,
  Trash2,
  ExternalLink,
  File as FileIcon,
  Eye,
  Music,
  Video,
} from "lucide-react";
import { FC, useState } from "react";

import { cn } from "@/utils/classNames";
import { formatBytes } from "@/utils/formatters";

interface FileGridProps {
  files: StorageFile[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onDownload: (file: StorageFile) => void;
  onPreview?: (file: StorageFile) => void;
  className?: string;
}

// ─── Icon & tone mapping ──────────────────────────────────────────────────────

const ICON_TONE: Record<string, { tile: string; text: string }> = {
  image:    { tile: "bg-violet-500/10",  text: "text-violet-500 dark:text-violet-400" },
  document: { tile: "bg-blue-500/10",    text: "text-blue-500 dark:text-blue-400" },
  code:     { tile: "bg-emerald-500/10", text: "text-emerald-500 dark:text-emerald-400" },
  data:     { tile: "bg-amber-500/10",   text: "text-amber-500 dark:text-amber-400" },
  video:    { tile: "bg-rose-500/10",    text: "text-rose-500 dark:text-rose-400" },
  audio:    { tile: "bg-sky-500/10",     text: "text-sky-500 dark:text-sky-400" },
  generic:  { tile: "bg-surface-hover",  text: "text-fg-secondary" },
};

const getFileIconAndTone = (type: string) => {
  if (type.startsWith("image/"))   return { Icon: ImageIcon, ...ICON_TONE.image };
  if (type.startsWith("video/"))   return { Icon: Video,     ...ICON_TONE.video };
  if (type.startsWith("audio/"))   return { Icon: Music,     ...ICON_TONE.audio };
  if (type.includes("json"))       return { Icon: FileJson,  ...ICON_TONE.data };
  if (type.includes("javascript") || type.includes("typescript")) return { Icon: FileCode, ...ICON_TONE.code };
  if (type.includes("pdf") || type.includes("text")) return { Icon: FileText, ...ICON_TONE.document };
  return { Icon: FileIcon, ...ICON_TONE.generic };
};

const isPreviewable = (type: string) =>
  type.startsWith("image/") ||
  type.startsWith("video/") ||
  type.startsWith("audio/") ||
  type.includes("pdf") ||
  type.startsWith("text/") ||
  type.includes("json");

// ─── Image thumbnail ──────────────────────────────────────────────────────────

const ImageThumbnail: FC<{ url: string; name: string }> = ({ url, name }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="h-10 w-10 rounded-[10px] flex items-center justify-center shrink-0 bg-violet-500/10">
        <ImageIcon className="h-5 w-5 text-violet-500 dark:text-violet-400" />
      </div>
    );
  }

  return (
    <div className="h-10 w-10 rounded-[10px] overflow-hidden shrink-0 bg-surface-muted border border-border-subtle">
      <img
        src={url}
        alt={name}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
};

// ─── Grid ─────────────────────────────────────────────────────────────────────

export const FileGrid: FC<FileGridProps> = ({
  files,
  isLoading,
  onDelete,
  onDownload,
  onPreview,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4", className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[152px] rounded-[16px]" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4", className)}>
      {files.map((file) => {
        const isImage    = file.type.startsWith("image/");
        const canPreview = isPreviewable(file.type);
        const { Icon, tile, text } = getFileIconAndTone(file.type);

        return (
          <article
            key={file.id}
            className={cn(
              "group relative flex flex-col gap-3 p-4 rounded-[16px]",
              "bg-surface border border-border",
              "hover:border-border-strong hover:shadow-[var(--shadow-card)]",
              "transition-all duration-200",
              canPreview && "cursor-pointer",
            )}
            onClick={() => canPreview && onPreview?.(file)}
          >
            {/* Top row: thumbnail/icon + menu */}
            <div className="flex items-start justify-between gap-2">
              {/* Icon / thumbnail */}
              <div className="relative">
                {isImage ? (
                  // Use thumbnailUrl (small WebP) when available, fallback to full URL
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  <ImageThumbnail url={(file as any).thumbnailUrl || file.url} name={file.name} />
                ) : (
                  <div className={cn("h-10 w-10 rounded-[10px] flex items-center justify-center shrink-0", tile)}>
                    <Icon className={cn("h-5 w-5", text)} />
                  </div>
                )}

                {/* Preview hover overlay for images */}
                {isImage && canPreview && (
                  <div className="absolute inset-0 rounded-[10px] bg-black/0 group-hover:bg-black/35 flex items-center justify-center transition-all duration-200">
                    <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                )}
              </div>

              {/* Context menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-fg-muted hover:text-fg opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity shrink-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  {/* Preview — primary action */}
                  {canPreview && (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); onPreview?.(file); }}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Vista previa</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onDownload(file); }}
                    className="cursor-pointer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    <span>Descargar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); window.open(file.url, "_blank"); }}
                    className="cursor-pointer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    <span>Abrir en nueva pestaña</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onDelete(file.id); }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Filename + meta */}
            <div className="min-w-0 flex flex-col gap-1">
              <p
                className="text-[13px] font-medium text-fg leading-snug truncate"
                title={file.name}
              >
                {file.name}
              </p>
              <div className="flex items-center justify-between gap-2 text-[11px] text-fg-muted tabular-nums">
                <span>{formatBytes(file.size)}</span>
                <span>
                  {new Date(file.createdAt).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};
