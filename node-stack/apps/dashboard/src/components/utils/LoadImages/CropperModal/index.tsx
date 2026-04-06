import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { compressImage } from "../compressImage";
import { Button } from "@/components/ui/form/Button";
import { ZoomIn, Scissors } from "lucide-react";
import { ModalLayout } from "@/layouts/ModalLayout";
import toast from "react-hot-toast";

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onCropComplete: (croppedUrl: string) => void;
  onClose: () => void;
  aspectRatio?: number;
  format: string;
  widthIMG: number;
  heightIMG: number;
}

const CropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  onCropComplete,
  onClose,
  aspectRatio = 4 / 5,
  format,
  widthIMG,
  heightIMG,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleCropCompleteCallback = useCallback(
    (_: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const getCroppedImage = async () => {
    let image = new Image();

    // The key fix for "Tainted Canvas":
    // "blob:" URLs are local and DO NOT need (and sometimes fail with) CORS headers.
    // External "http/https" URLs DO need CORS headers.
    const isLocal =
      imageSrc.startsWith("blob:") || imageSrc.startsWith("data:");
    if (!isLocal) {
      image.crossOrigin = "anonymous";
    }

    try {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = (err) => {
          // Si falla con CORS, intentar sin CORS como fallback (puede causar tainted canvas después, pero merece la pena intentar)
          if (!isLocal && image.crossOrigin) {
            console.warn("Fallo carga con CORS, intentando sin CORS...");
            const fallbackImage = new Image();
            fallbackImage.onload = () => {
              image = fallbackImage;
              resolve(null);
            };
            fallbackImage.onerror = reject;
            fallbackImage.src = imageSrc;
          } else {
            reject(err);
          }
        };
        // Agregar cache-buster para imágenes remotas para evitar el error de caché sin CORS
        if (!isLocal) {
          image.src =
            imageSrc +
            (imageSrc.includes("?") ? "&" : "?") +
            "corsbuster=" +
            Date.now();
        } else {
          image.src = imageSrc;
        }
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx || !croppedAreaPixels) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob(
        async (blob) => {
          if (blob) {
            const file = new File([blob], `cropped.${format}`, {
              type: `image/${format}`,
            });
            try {
              const { blobUrl } = await compressImage(file, {
                aspectRatio: `${aspectRatio}`,
                format,
                widthIMG,
                heightIMG,
              });
              onCropComplete(blobUrl);
            } catch (error) {
              console.error("Error al comprimir tras recorte:", error);
            }
          }
        },
        `image/${format}`,
        0.95
      );
    } catch (error) {
      toast.error(
        "No se pudo procesar la imagen para el recorte. Por favor, intenta con otra."
      );
      onClose();
    }
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-500">
            <Scissors className="h-4.5 w-4.5" />
          </div>
          <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
            Recortar
          </span>
        </div>
      }
      maxWidth="md"
      footer={
        <div className="flex flex-col sm:flex-row gap-2 w-full pt-1">
          <Button
            variant="ghost"
            onClick={onClose}
            fullWidth
            className="h-11 text-sm bg-gray-50 dark:bg-gray-800/50 text-gray-500 sm:order-1 sm:w-1/2"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={getCroppedImage}
            fullWidth
            className="h-11 text-sm shadow-primary-500/20 sm:order-2 sm:w-1/2"
          >
            Confirmar Recorte
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Cropper Area */}
        <div className="relative w-full aspect-square bg-black rounded-[2rem] overflow-hidden shadow-inner ring-1 ring-gray-200 dark:ring-gray-800">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropCompleteCallback}
            cropShape="rect"
            showGrid={true}
            style={{
              containerStyle: { background: "#000" },
              cropAreaStyle: {
                border: "2px solid rgba(255, 255, 255, 0.8)",
                borderRadius: "12px",
                outline: "none",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
              },
            }}
          />
        </div>

        {/* Controls */}
        <div className="space-y-5">
          <div className="space-y-3 pb-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <ZoomIn className="h-3.5 w-3.5" />
                Zoom
              </label>
              <span className="text-[10px] font-bold text-primary-500 bg-primary-100/50 dark:bg-primary-900/40 px-2 py-0.5 rounded-lg">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full appearance-none cursor-pointer accent-primary-500"
            />
          </div>
        </div>
      </div>
    </ModalLayout>
  );
};

export { CropperModal };
