export interface StoreError {
  message: string;
  fieldErrors?: Record<string, string>;
  statusCode?: number;
}

/**
 * Función de utilidad para transformar errores en un formato consistente para los stores
 */
export function handleStoreError(error: unknown): StoreError {
  if (error && typeof error === "object") {
    const apiError = error as {
      message?: string;
      fieldErrors?: Record<string, string>;
      statusCode?: number;
      // Estructura de error de Axios
      response?: {
        status?: number;
        data?: {
          message?: string;
          fieldErrors?: Record<string, string>;
        };
      };
    };

    // Manejar error de tipo Axios
    if (apiError.response) {
      const serverMessage = apiError.response.data?.message;
      const message = Array.isArray(serverMessage)
        ? serverMessage.join(", ")
        : serverMessage || apiError.message || "Error desconocido";

      return {
        message,
        fieldErrors: apiError.response.data?.fieldErrors,
        statusCode: apiError.response.status,
      };
    }

    // Manejar error directo de objeto (si el cliente API lo lanza de esta forma)
    if ("statusCode" in apiError || "message" in apiError) {
      return {
        message: apiError.message || "Error desconocido",
        fieldErrors: apiError.fieldErrors,
        statusCode: apiError.statusCode,
      };
    }
  }

  return {
    message: error instanceof Error ? error.message : "Error desconocido",
  };
}

/**
 * Interfaz para estados de store con propiedades asíncronas comunes
 */
export interface AsyncState {
  loading: boolean;
  error: StoreError | null;
}
