import { useQuery } from "@tanstack/react-query";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active?: boolean;
}

export interface ReleaseNote {
  id: string;
  type: "feature" | "improvement" | "fix";
  version: string;
  date: string;
  title: string;
  description: string;
}

export const useOnboardingStatus = () => {
  return useQuery<OnboardingStep[], Error>({
    queryKey: ["dashboard", "onboarding"],
    queryFn: async () => {
      // Placeholder for real API: apiClient.get("/workspaces/onboarding")
      return [
        { id: "1", title: "Perfil Personal", description: "Completa tu identidad", completed: true },
        { id: "2", title: "Método de Pago", description: "Activa tu suscripción", completed: false, active: true },
        { id: "3", title: "Canal de Noticias", description: "Configura la difusión", completed: false },
        { id: "4", title: "Primer Lanzamiento", description: "Despliega tu app", completed: false },
      ];
    },
  });
};

export const useReleaseNotes = () => {
  return useQuery<ReleaseNote[], Error>({
    queryKey: ["dashboard", "release-notes"],
    queryFn: async () => {
      // Placeholder for real API: apiClient.get("/release-notes")
      return [
        { id: "1", type: "feature", version: "2.1.0", date: "Hoy", title: "Nuevo Sistema de Analytics", description: "Gráficas de alta precisión integradas en el nuevo Command Center." },
        { id: "2", type: "improvement", version: "2.0.8", date: "Ayer", title: "Optimización Elora UI", description: "Mejoras en el rendimiento de los componentes del checkout y pricing." },
      ];
    },
  });
};
