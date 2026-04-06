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
    public fieldErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AppError";
  }

  static fromAxios(error: AxiosError): AppError {
    const response = error.response;
    const data = response?.data as Record<string, unknown> | undefined;
    
    let message = "An error occurred";
    let code = "UNKNOWN_ERROR";
    let statusCode = response?.status || 500;
    let fieldErrors: Record<string, string[]> | undefined;

    if (response?.status === 401) {
      message = "Unauthorized";
      code = "UNAUTHORIZED";
    } else if (response?.status === 403) {
      message = "Forbidden";
      code = "FORBIDDEN";
    } else if (response?.status === 404) {
      message = "Not found";
      code = "NOT_FOUND";
    } else if (response?.status === 422) {
      message = "Validation failed";
      code = "VALIDATION_ERROR";
      if (data?.errors) {
        fieldErrors = data.errors as Record<string, string[]>;
      }
    } else if (response?.status && response.status >= 500) {
      message = "Internal server error";
      code = "SERVER_ERROR";
    } else if (!response) {
      message = "Network error";
      code = "NETWORK_ERROR";
    }

    return new AppError(message, code, statusCode, fieldErrors);
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
    (response: AxiosResponse) => response,
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
