import { FC } from "react";
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
} from "lucide-react";
import { formatBytes } from "@/utils/formatters";
import { cn } from "@/utils/classNames";
import type { FileInfo as StorageFile } from "@node-stack/types";

interface FileGridProps {
  files: StorageFile[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onDownload: (file: StorageFile) => void;
  className?: string;
}

const ICON_TONE: Record<string, { tile: string; text: string }> = {
  image:    { tile: "bg-violet-500/10",  text: "text-violet-500 dark:text-violet-400" },
  document: { tile: "bg-blue-500/10",    text: "text-blue-500 dark:text-blue-400" },
  code:     { tile: "bg-emerald-500/10", text: "text-emerald-500 dark:text-emerald-400" },
  data:     { tile: "bg-amber-500/10",   text: "text-amber-500 dark:text-amber-400" },
  generic:  { tile: "bg-surface-hover",  text: "text-fg-secondary" },
};

const getFileIconAndTone = (type: string) => {
  if (type.includes("image")) return { Icon: ImageIcon, ...ICON_TONE.image };
  if (type.includes("json")) return { Icon: FileJson, ...ICON_TONE.data };
  if (type.includes("javascript") || type.includes("typescript")) return { Icon: FileCode, ...ICON_TONE.code };
  if (type.includes("pdf") || type.includes("text")) return { Icon: FileText, ...ICON_TONE.document };
  return { Icon: FileIcon, ...ICON_TONE.generic };
};

export const FileGrid: FC<FileGridProps> = ({
  files,
  isLoading,
  onDelete,
  onDownload,
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
        const { Icon, tile, text } = getFileIconAndTone(file.type);
        return (
          <article
            key={file.id}
            className={cn(
              "group relative flex flex-col gap-3 p-4 rounded-[16px]",
              "bg-surface border border-border",
              "hover:border-border-strong hover:shadow-[var(--shadow-card)]",
              "transition-all duration-200"
            )}
          >
            {/* Top row: icon tile + actions */}
            <div className="flex items-start justify-between gap-2">
              <div className={cn("h-10 w-10 rounded-[10px] flex items-center justify-center shrink-0", tile)}>
                <Icon className={cn("h-5 w-5", text)} />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-fg-muted hover:text-fg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem onClick={() => onDownload(file)}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Descargar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(file.url, "_blank")}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    <span>Ver original</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-500/10"
                    onClick={() => onDelete(file.id)}
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
                className="text-[13px] font-semibold text-fg leading-snug truncate"
                title={file.name}
              >
                {file.name}
              </p>
              <div className="flex items-center justify-between gap-2 text-[11px] text-fg-muted tabular-nums">
                <span>{formatBytes(file.size)}</span>
                <span>{new Date(file.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};
