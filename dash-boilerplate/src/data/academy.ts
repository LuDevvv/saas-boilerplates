export type AcademyCategory =
  | "Todos"
  | "Fundamentos"
  | "Operación"
  | "Marketing"
  | "Configuración"
  | "Ads";

export const academyCategories: AcademyCategory[] = [
  "Todos",
  "Fundamentos",
  "Operación",
  "Marketing",
  "Configuración",
  "Ads",
];

export const academyVideos = [
  {
    id: 1,
    title: "Creando Experiencias Memorables",
    description:
      "Descubre cómo el diseño de tu menú puede impactar la experiencia de tus clientes.",
    url: "https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4",
    thumbnail:
      "https://res.cloudinary.com/dawj6wbk4/image/upload/v1767663886/ChatGPT_Image_Jan_5_2026_09_35_59_PM_gowy1s.png",
    provider: "html5",
    duration: "0:24",
    search: "diseño menu menu clientes experiencia visual",
    category: "Fundamentos",
  },
  {
    id: 2,
    title: "Gestionar Pedidos en tiempo real",
    description:
      "Aprende a gestionar el flujo de pedidos en tu cocina de manera eficiente.",
    url: "https://videos.pexels.com/video-files/3191572/3191572-uhd_2560_1440_25fps.mp4",
    thumbnail:
      "https://res.cloudinary.com/dawj6wbk4/image/upload/v1767663897/ChatGPT_Image_Jan_5_2026_09_36_15_PM_kdw4di.png",
    provider: "html5",
    duration: "0:24",
    search: "pedidos cocina gestion tiempo real flow flujo",
    category: "Operación",
  },
  {
    id: 3,
    title: "Analizando tus métricas de venta",
    description:
      "Entiende mejor a tus clientes analizando los reportes de ventas.",
    url: "https://videos.pexels.com/video-files/4994039/4994039-uhd_2560_1440_25fps.mp4",
    thumbnail:
      "https://res.cloudinary.com/dawj6wbk4/image/upload/v1767663873/ChatGPT_Image_Jan_5_2026_09_34_05_PM_z2vl3d.png",
    provider: "html5",
    duration: "0:19",
    search: "metricas ventas reportes data clientes analisis",
    category: "Marketing",
  },
  {
    id: 4,
    title: "Personalización avanzada de QR",
    description:
      "Crea códigos QR únicos que representen la identidad de tu marca.",
    url: "https://videos.pexels.com/video-files/11537353/11537353-hd_1920_1080_30fps.mp4",
    thumbnail:
      "https://res.cloudinary.com/dawj6wbk4/image/upload/v1767663887/ChatGPT_Image_Jan_5_2026_09_33_56_PM_uuj1qj.png",
    provider: "html5",
    duration: "0:15",
    search: "qr personalizacion colores marca links identidad",
    category: "Configuración",
  },
  {
    id: 5,
    title: "Configuración de Horarios de Servicio",
    description:
      "Optimiza tu operación configurando los tiempos de servicio correctamente.",
    url: "https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4",
    thumbnail:
      "https://res.cloudinary.com/dawj6wbk4/image/upload/v1767663886/ChatGPT_Image_Jan_5_2026_09_35_59_PM_gowy1s.png",
    provider: "html5",
    duration: "0:24",
    search: "horarios tiempos servicio configuracion menu",
    category: "Operación",
  },
  {
    id: 6,
    title: "Gestión de Complementos y Adicionales",
    description:
      "Aumenta tu ticket promedio agregando complementos a tus productos.",
    url: "https://videos.pexels.com/video-files/3191572/3191572-uhd_2560_1440_25fps.mp4",
    thumbnail:
      "https://res.cloudinary.com/dawj6wbk4/image/upload/v1767663897/ChatGPT_Image_Jan_5_2026_09_36_15_PM_kdw4di.png",
    provider: "html5",
    duration: "0:24",
    search: "complementos extras adicionales productos ventas",
    category: "Operación",
  },
  {
    id: 7,
    title: "Publicidad y Banners Dinámicos",
    description:
      "Promociona tus mejores platillos con banners publicitarios llamativos.",
    url: "https://videos.pexels.com/video-files/11537353/11537353-hd_1920_1080_30fps.mp4",
    thumbnail:
      "https://res.cloudinary.com/dawj6wbk4/image/upload/v1767663887/ChatGPT_Image_Jan_5_2026_09_33_56_PM_uuj1qj.png",
    provider: "html5",
    duration: "0:15",
    search: "publicidad banners promociones marketing diseño",
    category: "Marketing",
  },
];
