import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from "axios";
import { ZodSchema, ZodError } from "zod";

export interface ClientConfig {
  baseURL: string;
  timeout?: number;
  getToken?: () => string | null | Promise<string | null>;
  getWorkspaceId?: () => string | null;
  onUnauthorized?: () => void | Promise<void>;
}

export interface RequestOptions<T = unknown> extends AxiosRequestConfig {
  params?: T;
  body?: T;
  schema?: ZodSchema<T>;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public fieldErrors?: Record<string, string[]>,
    public config?: InternalAxiosRequestConfig,
    public originalError?: AxiosError
  ) {
    super(message);
    this.name = "AppError";
  }

  static fromAxios(error: AxiosError): AppError {
    const response = error.response;
    const data = response?.data as Record<string, any> | undefined;
    
    // Prioritize message from server response (handles both raw and wrapped patterns)
    const serverMessage = data?.message || data?.data?.message || data?.error || data?.data?.error;
    let message = serverMessage || error.message || "Ha ocurrido un error";
    
    let code = (data?.code as string) || (data?.data?.code as string) || (data?.error as string) || "ERROR_DESCONOCIDO";
    let statusCode = response?.status || 500;
    let fieldErrors: Record<string, string[]> | undefined;

    if (response?.status === 401) {
      if (!serverMessage) message = "No autorizado";
      if (code === "ERROR_DESCONOCIDO" || code === "Unauthorized") code = "UNAUTHORIZED";
    } else if (response?.status === 403) {
      if (!serverMessage) message = "Acceso prohibido";
      if (code === "ERROR_DESCONOCIDO" || code === "Forbidden") code = "FORBIDDEN";
    } else if (response?.status === 404) {
      if (!serverMessage) message = "Recurso no encontrado";
      if (code === "ERROR_DESCONOCIDO" || code === "Not Found") code = "NOT_FOUND";
    } else if (response?.status === 422) {
      message = serverMessage || "Error de validación";
      code = "VALIDATION_ERROR";
      const errors = data?.errors || data?.data?.errors;
      if (errors) {
        fieldErrors = errors as Record<string, string[]>;
      }
    } else if (response?.status && response.status >= 500) {
      if (!serverMessage) message = "Error interno del servidor";
      code = "SERVER_ERROR";
    } else if (!response) {
      message = "Error de red o conexión";
      code = "NETWORK_ERROR";
    }

    return new AppError(message, code, statusCode, fieldErrors, error.config, error);
  }
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

function isTokenGetter(fn: unknown): fn is () => string | null | Promise<string | null> {
  return typeof fn === "function";
}

export function createClient(config: ClientConfig): AxiosInstance {
  const {
    baseURL,
    timeout = 10000,
    getToken,
    getWorkspaceId,
    onUnauthorized,
  } = config;

  const axiosInstance = axios.create({
    baseURL,
    timeout,
    headers: {
      "Content-Type": "application/json",
    },
  });

  axiosInstance.interceptors.request.use(
    async (internalConfig: InternalAxiosRequestConfig) => {
      if (isTokenGetter(getToken)) {
        const token = await getToken();
        if (token) {
          const authType = "Bearer";
          internalConfig.headers.Authorization = `${authType} ${token}`;
        }
      }

      const workspaceId = getWorkspaceId?.();
      if (workspaceId) {
        internalConfig.headers["X-Workspace-ID"] = workspaceId;
      }

      return internalConfig;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Handle professional pattern { data, meta }
      if (response.data && response.data.data !== undefined && response.data.meta !== undefined) {
        return response.data.data;
      }
      // Handle { data } wrapping
      if (response.data && response.data.data !== undefined && Object.keys(response.data).length === 1) {
        return response.data.data;
      }
      return response.data;
    },
    async (error: AxiosError) => {
      const response = error.response;

      if (response?.status === 401) {
        if (onUnauthorized) {
          await onUnauthorized();
        }
      }

      return Promise.reject(AppError.fromAxios(error));
    }
  );

  return axiosInstance;
}
