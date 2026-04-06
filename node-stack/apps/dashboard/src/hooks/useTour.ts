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
                        description: "Aquí verás qué te falta para tener tu menú profesional al 100%. Cada paso completado te acerca más a tus clientes.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "#bento-stats",
                    popover: {
                        title: "Analíticas en tiempo real",
                        description: "Visualiza cuántas personas han visto tu menú hoy y qué es lo más pedido.",
                        side: "top",
                        align: "center"
                    }
                },
                {
                    element: "#sidebar-branches",
                    popover: {
                        title: "Gestiona tu local",
                        description: "Desde aquí puedes configurar tus sucursales, horarios y métodos de envío.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#sidebar-products",
                    popover: {
                        title: "Tu Carta Digital",
                        description: "Añade platos, categorías y fotos increíbles para seducir a tus comensales.",
                        side: "right",
                        align: "start"
                    }
                },
                {
                    element: "#sidebar-qr",
                    popover: {
                        title: "Generador de QR",
                        description: "Descarga e imprime tus códigos QR únicos para que tus clientes accedan al instante.",
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
