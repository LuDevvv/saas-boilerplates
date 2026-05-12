import { Button } from "@node-stack/ui";
import { Upload, Loader2 } from "lucide-react";
import { FC, useRef } from "react";

interface FileUploadButtonProps {
  onUpload: (file: File) => Promise<void | { fileUrl: string } | undefined>;
  isUploading: boolean;
  /** Mantained for backwards compatibility but no longer rendered (progress lives in the global UploadTray). */
  progress?: number;
  className?: string;
  size?: "sm" | "md";
  /** Allow selecting multiple files at once (each triggers its own upload). */
  multiple?: boolean;
  /** Optional file accept filter (e.g. "image/*"). */
  accept?: string;
}

export const FileUploadButton: FC<FileUploadButtonProps> = ({
  onUpload,
  isUploading,
  className,
  size = "md",
  multiple = true,
  accept,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    // CRITICAL: reset before kicking off uploads so a failed file can be re-selected.
    resetInput();

    // Fire each upload concurrently — they're tracked individually in the tray.
    await Promise.allSettled(files.map((file) => onUpload(file)));
  };

  const heightClass = size === "sm" ? "h-9 px-4 text-[12px]" : "h-10 px-5 text-[13px]";

  const isFullWidth = className?.includes("w-full");

  return (
    <div className={`relative ${className ?? ""}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple={multiple}
        accept={accept}
        className="hidden"
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={`rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground font-medium ${heightClass} transition-all active:scale-[0.98]${isFullWidth ? " w-full" : ""}`}
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            Subiendo…
          </>
        ) : (
          <>
            <Upload className="mr-1.5 h-4 w-4" />
            Subir archivo{multiple ? "s" : ""}
          </>
        )}
      </Button>
    </div>
  );
};
