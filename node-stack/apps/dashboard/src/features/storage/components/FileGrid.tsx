import { FC } from "react";
import { 
  Card, 
  Button, 
  Skeleton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
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
  File as FileIcon
} from "lucide-react";
import { formatBytes } from "@/utils/formatters";
import type { StorageFile } from "../api/storage.api";

interface FileGridProps {
  files: StorageFile[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onDownload: (file: StorageFile) => void;
}

const getFileIcon = (type: string) => {
  if (type.includes("image")) return ImageIcon;
  if (type.includes("json")) return FileJson;
  if (type.includes("javascript") || type.includes("typescript")) return FileCode;
  if (type.includes("pdf") || type.includes("text")) return FileText;
  return FileIcon;
};

export const FileGrid: FC<FileGridProps> = ({ files, isLoading, onDelete, onDownload }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-48 rounded-[24px]" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {files.map((file) => {
        const Icon = getFileIcon(file.type);
        return (
          <Card 
            key={file.id} 
            className="group p-5 rounded-[24px] border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex flex-col h-full gap-4">
              <div className="flex justify-between items-start relative z-10">
                <div className={`p-2.5 rounded-xl transition-colors ${file.status === "Ready" ? "bg-primary-50 dark:bg-primary-500/5 text-primary-600 dark:text-primary-400" : "bg-slate-50 text-slate-400"}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10"
                      onClick={() => onDelete(file.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1 relative z-10">
                <h4 className="text-sm font-heading text-slate-900 dark:text-white truncate" title={file.name}>
                  {file.name}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-label text-slate-400 uppercase">{formatBytes(file.size)}</span>
                  <span className="text-[10px] font-label text-slate-400">{new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Background Accent */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </Card>
        );
      })}
    </div>
  );
};
