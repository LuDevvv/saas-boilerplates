import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Check, 
  AlertCircle, 
  Loader2, 
  Camera, 
  Trash2,
  Crop
} from 'lucide-react';
import { cn } from '@/utils/classNames';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  initialImage?: string | null;
  onUpload: (file: File, onProgress: (p: number) => void) => Promise<void>;
  onDelete?: () => Promise<void>;
  maxSizeMB?: number;
  aspectRatio?: 'square' | 'video' | 'any';
  className?: string;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  initialImage,
  onUpload,
  onDelete,
  maxSizeMB = 2,
  aspectRatio = 'square',
  className,
  label = "Subir Imagen"
}) => {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return "El archivo debe ser una imagen (JPG, PNG, WebP).";
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `La imagen excede el límite de ${maxSizeMB}MB.`;
    }
    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setStatus('error');
      toast.error(validationError);
      return;
    }

    startUpload(file);
  };

  const startUpload = async (file: File) => {
    setStatus('uploading');
    setProgress(0);
    setError(null);

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      await onUpload(file, (p) => setProgress(p));
      setStatus('success');
      toast.success("Imagen subida con éxito");
    } catch (err: any) {
      console.error("Upload failed:", err);
      setStatus('error');
      setError("Error durante la subida.");
      toast.error("No se pudo subir la imagen");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;

    try {
      await onDelete();
      setPreview(null);
      setStatus('idle');
      toast.success("Imagen eliminada");
    } catch (err) {
      toast.error("Error al eliminar la imagen");
    }
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
    setPreview(initialImage || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={cn("relative w-full group", className)}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      <motion.div
        layout
        className={cn(
          "relative overflow-hidden rounded-[2rem] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-800/20 shadow-sm",
          status === 'idle' && "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 cursor-pointer",
          status === 'uploading' && "border-blue-500/50 bg-blue-50/20 dark:bg-blue-900/5",
          status === 'success' && "border-emerald-500/30 bg-white dark:bg-gray-900 border-solid shadow-xl shadow-emerald-500/5",
          status === 'error' && "border-red-500/30 bg-red-50/20 dark:bg-red-900/5",
          aspectRatio === 'square' ? "aspect-square max-w-[240px] mx-auto" : "aspect-video w-full"
        )}
        onClick={() => status !== 'uploading' && fileInputRef.current?.click()}
      >
        <AnimatePresence mode="wait">
          {/* IDLE STATE */}
          {status === 'idle' && !preview && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3 p-6"
            >
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{label}</p>
                <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-widest">
                  PNG, JPG · Máx {maxSizeMB}MB
                </p>
              </div>
            </motion.div>
          )}

          {/* UPLOADING STATE */}
          {status === 'uploading' && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 w-full px-8"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest animate-pulse">
                Subiendo...
              </p>
            </motion.div>
          )}

          {/* SUCCESS / PREVIEW STATE */}
          {(status === 'success' || (status === 'idle' && preview)) && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative w-full h-full group/preview"
            >
              <img 
                src={preview!} 
                alt="Upload preview" 
                className="w-full h-full object-cover"
              />
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white backdrop-blur-md transition-all active:scale-95"
                  title="Cambiar imagen"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white backdrop-blur-md transition-all active:scale-95 opacity-50 cursor-not-allowed"
                  title="Recortar (Próximamente)"
                >
                  <Crop className="w-5 h-5" />
                </button>
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="p-3 bg-red-500/80 hover:bg-red-500 border border-red-400/30 rounded-2xl text-white transition-all active:scale-95"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Status Badge */}
              {status === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 p-2 bg-emerald-500 text-white rounded-full shadow-lg border-4 border-white dark:border-gray-900"
                >
                  <Check className="w-4 h-4" />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ERROR STATE */}
          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 p-6"
            >
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-red-500">Error en la subida</p>
                <p className="text-[10px] font-medium text-red-400 mt-1 max-w-[150px]">
                  {error || "Lo sentimos, algo salió mal."}
                </p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="mt-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Intentar de nuevo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
