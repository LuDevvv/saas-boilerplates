# LoadImages Component

El componente **LoadImages** es un módulo de React para la gestión avanzada de carga y procesamiento de imágenes, con soporte para múltiples formatos y manipulación interactiva.

## Características

- **Carga múltiple:** Soporta carga simultánea de hasta 8 imágenes
- **Métodos de entrada:** Selector de archivos y drag & drop
- **Formatos soportados:** WebP, JPEG, PNG, GIF, BMP, TIFF, HEIC, SVG
- **Procesamiento:** Recorte automático/manual y compresión integrada
- **UI Interactiva:** Previsualización, botones de acción y feedback visual
- **Gestión de errores:** Validación de formatos y límites con mensajes informativos
- **Integración con servicios:** Soporte para eliminación remota de archivos

## Propiedades

```typescript
interface LoadImagesProps {
  aspectRatio: string; // "4/5"
  format: string; // "webp"
  limitImages?: number; // Default: 8
  widthIMG: number; // Ancho de salida
  heightIMG: number; // Alto de salida
  dataImages: (files: File[]) => void;
  initialImages?: {
    url: string;
    publicId: string;
  }[];
  folder?: string; // Default: "default"
}
```

## Uso

```jsx
<LoadImages
  aspectRatio="4/5"
  format="webp"
  limitImages={8}
  widthIMG={640}
  heightIMG={800}
  dataImages={setImagesData}
  initialImages={[
    { url: "imagen1.webp", publicId: "id1" },
    { url: "imagen2.webp", publicId: "id2" },
  ]}
  folder="productos"
/>
```

## Interfaz de Usuario

- **Zona de carga:** Área interactiva para drag & drop
- **Botón de selección:** Diseño moderno con ícono y efectos hover
- **Previsualizaciones:** Grid de miniaturas con opción de eliminación
- **Mensajes de error:** Feedback visual para validaciones
- **Modal de recorte:** Interfaz para ajustes manuales del recorte

## Integración con Servicios

El componente incluye integración con servicios de almacenamiento para:

- Carga inicial de imágenes existentes
- Eliminación de archivos del servidor
- Gestión de IDs públicos para referencias externas
