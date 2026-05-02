import { FC, useRef } from "react";
import { Button, Progress } from "@node-stack/ui";
import { Upload, Loader2 } from "lucide-react";

interface FileUploadButtonProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  progress: number;
}

export const FileUploadButton: FC<FileUploadButtonProps> = ({ onUpload, isUploading, progress }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await onUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="rounded-2xl bg-primary hover:bg-primary-600 text-white font-heading uppercase text-[10px] h-11 px-6 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Subiendo...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Subir Archivo
          </>
        )}
      </Button>

      {isUploading && (
        <div className="absolute top-full left-0 right-0 mt-3 p-3 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-white/5 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-heading uppercase text-slate-400">Progreso</span>
            <span className="text-[9px] font-heading text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}
    </div>
  );
};
