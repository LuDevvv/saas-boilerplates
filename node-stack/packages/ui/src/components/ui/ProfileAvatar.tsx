import { FC, useRef, useState, useEffect } from "react";
import { Trash2, Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./Avatar.js";
import { cn } from "../../utils.js";

interface ProfileAvatarProps {
  src?: string;
  fallback: string;
  size?: "sm" | "md" | "lg" | "xl";
  isEditable?: boolean;
  onImageChange?: (file: File | null) => void;
  onError?: (error: { title: string; description: string }) => void;
  maxSizeMB?: number;
  className?: string;
  isUploading?: boolean;
}

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24",
  lg: "h-24 w-24 sm:h-28 sm:w-28 lg:h-36 lg:w-36", // Smoother progression for tablet/desktop
  xl: "h-32 w-32 sm:h-40 sm:w-40 lg:h-48 lg:w-48",
};

export const ProfileAvatar: FC<ProfileAvatarProps> = ({ 
  src, 
  fallback, 
  size = "lg", 
  isEditable = true, 
  onImageChange, 
  onError,
  maxSizeMB = 5,
  className,
  isUploading = false,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(null);
  }, [src]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUploading) return;
    setPreview(null);
    onImageChange?.(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      onError?.({
        title: "Archivo demasiado grande",
        description: `El tamaño máximo permitido es de ${maxSizeMB}MB.`
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      onError?.({
        title: "Tipo de archivo no válido",
        description: "Por favor, selecciona una imagen."
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onImageChange?.(file);
  };

  return (
    <div className={cn("relative group/avatar shrink-0 select-none", className)}>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />
      
      {/* 
          Main Avatar Container 
          - Overflow hidden is only here, NOT on the parent wrapper 
      */}
      <div className={cn(
        "rounded-full border-2 border-border bg-surface-muted overflow-hidden relative flex items-center justify-center transition-all duration-300",
        sizeClasses[size],
        (isEditable && !isUploading) && "cursor-pointer"
      )}>
        <Avatar className="h-full w-full rounded-full border-none">
          <AvatarImage src={preview || src || ""} className="object-cover rounded-full h-full w-full" />
          <AvatarFallback className="text-3xl sm:text-4xl md:text-5xl bg-primary/10 font-black text-primary uppercase rounded-full">
            {fallback?.[0] || "?"}
          </AvatarFallback>
        </Avatar>

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-30">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}

        {/* Desktop Hover Overlay */}
        {isEditable && !isUploading && (
          <div
            onClick={handleEditClick}
            className="hidden md:flex absolute inset-0 bg-black/20 opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 items-center justify-center backdrop-blur-[1px] z-10 rounded-full"
          >
            <div className="bg-surface-elevated border border-border p-3 rounded-full shadow-xl transform scale-75 group-hover/avatar:scale-100 transition-all duration-500">
              <Camera className="h-6 w-6 text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* 
          Floating Controls (Mobile & Tablet) 
          - Now living outside the overflow-hidden container to prevent clipping 
      */}
      {isEditable && (
        <div className="absolute bottom-0 right-0 flex flex-col gap-2 md:hidden z-20">
          <button
            onClick={handleEditClick}
            type="button"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary text-primary-foreground border-2 border-surface shadow-xl flex items-center justify-center active:scale-90 transition-all"
          >
            <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {(preview || src) && (
            <button
              onClick={handleRemoveClick}
              type="button"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-red-500 text-white border-2 border-surface shadow-xl flex items-center justify-center active:scale-90 transition-all animate-in fade-in zoom-in duration-300"
            >
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
        </div>
      )}

      {/* Desktop Quick Delete */}
      {isEditable && (preview || src) && (
        <button
          onClick={handleRemoveClick}
          className="hidden md:flex absolute top-1 right-1 h-8 w-8 rounded-full bg-red-500 text-white border-2 border-surface shadow-lg items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 hover:scale-110 active:scale-90 z-20"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
