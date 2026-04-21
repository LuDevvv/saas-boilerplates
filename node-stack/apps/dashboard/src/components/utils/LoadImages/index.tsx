import React, { useState, useCallback, useEffect } from "react";
import { Upload, X, ImageIcon, Crop } from "lucide-react";
import { CropperModal } from "./CropperModal/index.js";
import { compressImage } from "./compressImage.js";
import { cn } from "@utils/classNames";

interface ImageObject {
  file?: File;
  localUrl: string;
  state: "new" | "original" | "deleted";
  id?: string;
  originalFile?: File;
  originalLocalUrl?: string;
  index?: number;
}

interface InitialImage {
  mediaId: string;
  url: string;
  publicId: string;
  originalLocalUrl?: string;
}

interface LoadImagesProps {
  aspectRatio: string; // Ejemplo: "4/5"
  format: string; // Ejemplo: "webp"
  limitImages: number;
  widthIMG: number; // Ancho deseado de la imagen de salida
  heightIMG: number; // Alto deseado de la imagen de salida
  dataImages: (images: ImageObject[]) => void;
  initialImages?: InitialImage[]; // Ahora acepta la estructura completa
}

interface CompressedImageResult {
  file: File;
  blobUrl: string;
}

const LoadImages: React.FC<LoadImagesProps> = ({
  aspectRatio,
  format,
  limitImages,
  widthIMG,
  heightIMG,
  dataImages,
  initialImages,
}) => {
  const [imageObjects, setImageObjects] = useState<ImageObject[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [openCropImage, setOpenCropImage] = useState(false);

  // Cada vez que imageObjects cambie, se lo enviamos al padre
  useEffect(() => {
    dataImages(imageObjects);
  }, [imageObjects, dataImages]);

  const addIndexToImages = (images: ImageObject[]): ImageObject[] => {
    return images.map((image, index) => ({
      ...image,
      index,
    }));
  };

  // Comprimir/recortar automáticamente la imagen
  const cropImageAutomatically = async (
    file: File
  ): Promise<CompressedImageResult> => {
    return compressImage(file, { aspectRatio, format, widthIMG, heightIMG });
  };

  const generateVirtualImages = async (imagesOnline: InitialImage[]) => {
    if (imagesOnline.length >= 1) {
      const newVirtualImages = await Promise.all(
        imagesOnline.map(async (image, index): Promise<ImageObject> => {
          try {
            // Fetch de la imagen y convertirla en Blob
            const response = await fetch(image.url, { mode: "cors" });
            const blob = await response.blob();

            // Crear un objeto File desde el Blob
            const file = new File([blob], `image-${index}`, {
              type: blob.type,
            });

            // Comprimir/recortar automáticamente la imagen
            const { blobUrl } = await cropImageAutomatically(file);

            let orignalImageBase = image.originalLocalUrl
              ? image.originalLocalUrl
              : blobUrl;

            return {
              file,
              localUrl: blobUrl,
              state: "original",
              id: image.mediaId,
              originalLocalUrl: orignalImageBase,
            };
          } catch (error) {
            console.warn(
              "Could not process initial image (CORS?), using original URL:",
              image.url
            );
            return {
              file: undefined,
              localUrl: image.url,
              state: "original",
              id: image.mediaId,
              originalLocalUrl: image.url,
            };
          }
        })
      );

      return addIndexToImages(newVirtualImages);
    }

    // Si no hay imágenes, devuelve un array vacío
    return [];
  };

  useEffect(() => {
    const loadInitialImages = async () => {
      if (initialImages && initialImages.length > 0) {
        const newImageObjects = await generateVirtualImages(initialImages);

        // Aseguramos que siempre sea un array
        setImageObjects((prev) => [...prev, ...(newImageObjects ?? [])]);
      }
    };

    loadInitialImages();
    // Solo ejecutar una vez al montar el componente
  }, []);

  const generateNewObjetImage = async (newFiles: File[]) => {
    // Espera a que todas las promesas en el array se resuelvan
    const newImageObjects = await Promise.all(
      newFiles.map(async (fileOriginal: File): Promise<ImageObject> => {
        const originalBlobUrl = URL.createObjectURL(fileOriginal);

        const { file, blobUrl } = await cropImageAutomatically(fileOriginal);

        return {
          file,
          localUrl: blobUrl,
          state: "new",
          originalLocalUrl: originalBlobUrl,
        };
      })
    );

    setImageObjects((prev: ImageObject[]) => [
      ...addIndexToImages([...prev, ...newImageObjects]),
    ]);
  };

  // Manejo de selección de archivos (input)
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    // Filtra los objetos que no están marcados como "deleted"
    const validImageObjects = imageObjects.filter(
      (image) => image.state !== "deleted"
    );

    let newFiles = Array.from(files);
    if (validImageObjects.length + newFiles.length > limitImages) {
      newFiles = newFiles.slice(0, limitImages - validImageObjects.length);
    }

    generateNewObjetImage(newFiles);
  };

  // Manejo de Drag & Drop
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      let droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (imageObjects.length + droppedFiles.length > limitImages) {
        droppedFiles = droppedFiles.slice(0, limitImages - imageObjects.length);
      }

      if (droppedFiles.length) {
        generateNewObjetImage(droppedFiles);
      }
    },
    [imageObjects, limitImages]
  );

  // Eliminar imagen
  const removeImage = (index: number) => {
    setCurrentIndex(index);

    setImageObjects((prevImages: ImageObject[]) => {
      // Hacemos una copia del array para mantener la inmutabilidad
      const updated = [...prevImages];

      // Verificamos que el índice esté dentro de los límites del array
      if (index >= 0 && index < updated.length) {
        updated[index] = {
          ...updated[index],
          localUrl: updated[index]?.localUrl || "", // refuerzo que existe
          state: "deleted",
        };
      }

      return updated;
    });
  };

  // Finalizar recorte manual
  const handleCropComplete = async (localUrl: string) => {
    const currentImage = imageObjects[currentIndex];
    if (currentImage) {
      // Convertir la URL recortada en un formato compatible con generateVirtualImages
      const virtualImageData: InitialImage[] = [
        {
          url: localUrl,
          mediaId: currentImage.id ?? "",
          publicId: currentImage.id ?? "",
          originalLocalUrl: currentImage.originalLocalUrl || "",
        },
      ];

      // Reutiliza la función existente para generar la imagen virtual
      const newVirtualImage = await generateVirtualImages(virtualImageData);

      // Si se generó correctamente, actualiza el estado
      if (newVirtualImage && newVirtualImage.length > 0) {
        setImageObjects((prevImages: ImageObject[]) => {
          const updated = [...prevImages];

          // Verifica que currentIndex esté dentro de los límites del array
          if (currentIndex < updated.length && newVirtualImage[0]?.localUrl) {
            updated[currentIndex] = {
              ...updated[currentIndex],
              ...newVirtualImage[0],
              localUrl: newVirtualImage[0].localUrl, // aseguramos que sea string
              state: "new", // Se marca como nueva al ser recortada manualmente
            };
          }

          return addIndexToImages(updated);
        });
      }
    }

    setOpenCropImage(false);
  };

  // Convertir el aspectRatio string a número para el CropperModal
  const computedAspect = aspectRatio.includes("/")
    ? Number(aspectRatio.split("/")[0]) / Number(aspectRatio.split("/")[1])
    : Number(aspectRatio);

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[15px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary-500" />
          Galería de Imágenes
        </h3>
        <span className="text-[12px] font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {imageObjects.filter((obj) => obj.state !== "deleted").length} /{" "}
          {limitImages}
        </span>
      </div>

      <div
        className={cn(
          "relative group cursor-pointer transition-all duration-500 ease-out-expo border-2 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-3",
          "bg-white dark:bg-gray-950",
          isDragging
            ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 ring-8 ring-primary-500/5 scale-[0.99]"
            : "border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl hover:shadow-primary-500/5"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() =>
          document
            .querySelector<HTMLInputElement>(`input[data-loadimages-id]`)
            ?.click()
        }
      >
        <div
          className={cn(
            "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500",
            isDragging
              ? "bg-primary-500 text-white scale-110 rotate-6 shadow-lg shadow-primary-500/30"
              : "bg-gray-50 dark:bg-gray-900 text-gray-400 group-hover:text-primary-500 group-hover:scale-110 shadow-inner"
          )}
        >
          <Upload className="h-8 w-8" />
        </div>

        <div className="text-center space-y-1">
          <p className="text-base font-black text-gray-900 dark:text-white tracking-tight">
            Arrastra o Selecciona
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            Haz click para{" "}
            <span className="text-primary-500 font-bold">
              explorar archivos
            </span>
          </p>
        </div>

        <input
          type="file"
          data-loadimages-id="true"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
      </div>

      {imageObjects.filter((obj) => obj.state !== "deleted").length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {imageObjects
            .filter((obj) => obj.state !== "deleted")
            .map((obj, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 animate-in fade-in zoom-in-95"
              >
                <img
                  src={obj.localUrl}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover lg:group-hover:scale-110 transition-transform duration-700 ease-out-expo"
                />

                {/* Overlay: Botones más pequeños y elegantes para evitar saturación */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20 to-transparent lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (obj.index !== undefined) {
                        setCurrentIndex(obj.index);
                        setOpenCropImage(true);
                      }
                    }}
                    className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white hover:text-primary-500 transition-all duration-300 shadow-md border border-white/10 active:scale-95"
                    title="Recortar"
                  >
                    <Crop className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (obj.index !== undefined) {
                        removeImage(obj.index);
                      }
                    }}
                    className="p-2 bg-red-500/10 backdrop-blur-md rounded-xl text-white hover:bg-red-500 transition-all duration-300 shadow-md border border-red-500/20 active:scale-95"
                    title="Eliminar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Index badge */}
                <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-xl border border-white/20">
                  {index + 1}
                </div>
              </div>
            ))}
        </div>
      )}

      <CropperModal
        isOpen={openCropImage}
        imageSrc={imageObjects[currentIndex]?.originalLocalUrl || ""}
        onCropComplete={handleCropComplete}
        onClose={() => setOpenCropImage(false)}
        aspectRatio={computedAspect}
        format={format}
        widthIMG={widthIMG}
        heightIMG={heightIMG}
      />
    </div>
  );
};

export { LoadImages };
