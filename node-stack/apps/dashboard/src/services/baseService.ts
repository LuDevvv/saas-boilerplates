import { AxiosResponse } from "axios";
import apiClient from "@/lib/api-client";

/**
 * Base service class to handle common API operations and Mocking logic.
 * Every service (Auth, Analytics, etc.) should extend this class.
 */
export class BaseService {
  protected useMocks: boolean = import.meta.env["VITE_USE_MOCKS"] === "true";
  protected endpoint: string;

  constructor(endpoint: string = "") {
    this.endpoint = endpoint;
  }

  /**
   * Generic GET request with mock support
   */
  protected async get<T>(path: string, mockPath?: string): Promise<T> {
    if (this.useMocks && mockPath) {
      return this.getMockData<T>(mockPath);
    }
    
    const response: AxiosResponse<T> = await apiClient.get(`${this.endpoint}${path}`);
    return response.data;
  }

  /**
   * Generic POST request with mock support
   */
  protected async post<T>(path: string, data?: any, mockData?: T): Promise<T> {
    if (this.useMocks && mockData !== undefined) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return mockData;
    }

    const response: AxiosResponse<T> = await apiClient.post(`${this.endpoint}${path}`, data);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  protected async put<T>(path: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.put(`${this.endpoint}${path}`, data);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  protected async delete<T>(path: string): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.delete(`${this.endpoint}${path}`);
    return response.data;
  }

  /**
   * Helper to load a JSON file from the public/mocks directory.
   */
  protected async getMockData<T>(path: string): Promise<T> {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const response = await fetch(`/mocks/${path}`);
    if (!response.ok) {
      throw new Error(`Failed to load mock data: ${path}`);
    }
    return response.json() as Promise<T>;
  }
}
