import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const useTour = () => {
    const startDashboardTour = () => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            nextBtnText: "Siguiente —›",
            prevBtnText: "‹— Anterior",
            doneBtnText: "¡Listo!",
            steps: [
                {
                    element: "#onboarding-progress",
                    popover: {
                        title: "Tu camino al éxito",
                        description: "Aquí verás el progreso de configuración de tu cuenta. Completa todos los pasos para aprovechar al máximo la plataforma.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#bento-stats",
                    popover: {
                        title: "Analíticas en tiempo real",
                        description: "Visualiza el rendimiento de tu negocio con métricas clave actualizadas al instante.",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: "#sidebar-workspaces",
                    popover: {
                        title: "Gestiona tus espacios",
                        description: "Desde aquí puedes crear y administrar diferentes áreas de trabajo o sedes.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#sidebar-products",
                    popover: {
                        title: "Gestión de Activos",
                        description: "Administra tu inventario, servicios o productos con facilidad.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#sidebar-analytics",
                    popover: {
                        title: "Reportes Avanzados",
                        description: "Accede a informes detallados y filtrado inteligente de tus datos.",
                        side: "right",
                        align: "start"
                    }
                },
            ],
        });

        driverObj.drive();
    };

    return { startDashboardTour };
};
