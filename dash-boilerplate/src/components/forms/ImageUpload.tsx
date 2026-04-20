import React, { useRef, useState, useEffect } from "react";
import {
  Camera,
  Check,
  Trash,
  X,
  Upload,
  Loader2,
  UserCircle,
} from "lucide-react";
import { appToast } from "@/components/alerts/Toasts";
import { cn } from "@utils/classNames";

interface ImageUploadProps {
  initialImage?: string | null;
  onChange?: (file: File) => void;
  variant?: "profile" | "banner";
  alt?: string;
  editable?: boolean;
  onSubmit?: (file: File) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ImageUpload = ({
  initialImage,
  onChange,
  variant = "profile",
  alt = "Image",
  editable = false,
  onSubmit,
  onCancel,
  onDelete,
  isLoading = false,
}: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImage ?? null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDropActive, setIsDropActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset preview when initialImage changes
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(initialImage ?? null);
    }
  }, [initialImage, selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handleFileSelected = (file: File) => {
    if (file.size > 1 * 1024 * 1024) {
      appToast.error({
        title: "Archivo muy pesado",
        description: "El tamaño máximo permitido es de 1MB para optimizar el rendimiento."
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      appToast.error({
        title: "Formato inválido",
        description: "Por favor, selecciona una imagen (JPG, PNG o WebP)."
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
    onChange?.(file);
  };

  const handleCancel = () => {
    setPreviewUrl(initialImage ?? null);
    setSelectedFile(null);
    onCancel?.();
  };

  const handleDelete = () => {
    onDelete?.();
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onSubmit?.(selectedFile);
    }
  };

  const containerStyles =
    variant === "profile"
      ? "w-32 h-32 rounded-full ring-4 ring-white dark:ring-gray-900 shadow-xl"
      : "w-full h-52 rounded-2xl shadow-lg";

  return (
    <div
      className="flex group w-full justify-center items-center"
      onMouseEnter={() => editable && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={containerRef}
        className={cn(
          containerStyles,
          "relative overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center transition-all duration-500",
          editable && "cursor-pointer",
          isDropActive && "ring-4 ring-primary-500/50 bg-primary-50 dark:bg-primary-900/10"
        )}
        onDragOver={(e) => { e.preventDefault(); editable && setIsDropActive(true); }}
        onDragLeave={() => setIsDropActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDropActive(false);
          if (editable && e.dataTransfer.files?.[0]) handleFileSelected(e.dataTransfer.files[0]);
        }}
        onClick={() => editable && !selectedFile && fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <div className="relative w-full h-full">
            <img
              src={previewUrl}
              alt={alt}
              className={cn(
                "w-full h-full object-cover transition-transform duration-700",
                isHovered && editable ? "scale-110" : "scale-100"
              )}
            />
            {editable && (isHovered || isDropActive) && !isLoading && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                <div className="flex gap-2">
                  {selectedFile ? (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); handleCancel(); }} className="p-2 bg-white rounded-xl text-red-500"><X className="w-5 h-5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleSubmit(); }} className="p-2 bg-primary-500 rounded-xl text-white"><Check className="w-5 h-5" /></button>
                    </>
                  ) : (
                    <>
                      {initialImage && <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="p-2 bg-white rounded-xl text-red-500"><Trash className="w-5 h-5" /></button>}
                      <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="p-2 bg-white rounded-xl text-primary-500"><Camera className="w-5 h-5" /></button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className={cn(
              "w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700 transition-colors",
              isHovered && "text-primary-500/50"
            )}>
              {isLoading ? (
                <Loader2 className="w-10 h-10 animate-spin" />
              ) : isDropActive ? (
                <Upload className="w-10 h-10 animate-bounce" />
              ) : (
                <UserCircle className="w-3/4 h-3/4 opacity-20" />
              )}
            </div>
            {editable && !isLoading && !isDropActive && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 dark:bg-gray-800/90 p-3 rounded-2xl shadow-xl">
                  <Camera className="w-6 h-6 text-primary-500" />
                </div>
              </div>
            )}
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-white/40 dark:bg-gray-950/40 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        )}
      </div>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
    </div>
  );
};
