interface ImageCompressorOptions {
  aspectRatio: string; // Ejemplo: "4/5"
  format: string; // Ejemplo: "webp"
  widthIMG: number; // Ancho deseado de la imagen de salida
  heightIMG: number; // Alto deseado de la imagen de salida
}

interface CompressedImageResult {
  file: File;
  blobUrl: string;
}

export const compressImage = (
  file: File,
  { aspectRatio, format, widthIMG, heightIMG }: ImageCompressorOptions
): Promise<CompressedImageResult> => {
  return new Promise<CompressedImageResult>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.src = url;

    // Convertir aspectRatio de "4/5" a número (ejemplo: 4/5 = 0.8)
    const desiredRatio = aspectRatio.includes("/")
      ? Number(aspectRatio.split("/")[0]) / Number(aspectRatio.split("/")[1])
      : Number(aspectRatio);

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Calcular dimensiones de recorte para mantener la relación de aspecto deseada
      let cropWidth: number,
        cropHeight: number,
        offsetX: number,
        offsetY: number;
      if (image.width / image.height > desiredRatio) {
        // La imagen es más ancha que la relación deseada: recortar ancho
        cropHeight = image.height;
        cropWidth = image.height * desiredRatio;
      } else {
        // La imagen es más alta: recortar alto
        cropWidth = image.width;
        cropHeight = image.width / desiredRatio;
      }
      offsetX = (image.width - cropWidth) / 2;
      offsetY = (image.height - cropHeight) / 2;

      // Definir dimensiones de salida según widthIMG y heightIMG
      canvas.width = widthIMG;
      canvas.height = heightIMG;

      if (ctx) {
        ctx.drawImage(
          image,
          offsetX,
          offsetY,
          cropWidth,
          cropHeight,
          0,
          0,
          widthIMG,
          heightIMG
        );
      }

      // Convertir el canvas a Blob usando el formato indicado
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], `compressed.${format}`, {
            type: `image/${format}`,
            lastModified: Date.now(),
          });
          const blobUrl = URL.createObjectURL(blob);
          resolve({ file: compressedFile, blobUrl });
        } else {
          reject(new Error("Error al comprimir la imagen"));
        }
      }, `image/${format}`);
    };

    image.onerror = () => {
      reject(new Error("Error al cargar la imagen"));
    };
  });
};
