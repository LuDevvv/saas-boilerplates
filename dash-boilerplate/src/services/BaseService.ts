
/**
 * Base class for all data services.
 * Implements a Mock Strategy based on VITE_USE_MOCKS environment variable.
 */
export abstract class BaseService {
  protected domain: string;

  constructor(domain: string) {
    this.domain = domain;
  }

  /**
   * Wrapper for API requests with transparent Mock support.
   * @param request Lambda that executes the actual API call (e.g. () => apiClient.get('/users'))
   * @param mockFile Optional custom JSON file name in /mocks/ directory. Defaults to domain name.
   */
  protected async handleRequest<T>(
    request: () => Promise<any>,
    mockFile?: string
  ): Promise<T> {
    const useMocks = import.meta.env.VITE_USE_MOCKS === "true";

    if (useMocks) {
      const fileName = mockFile || this.domain;
      try {
        const response = await fetch(`/mocks/${fileName}.json`);
        if (!response.ok) {
          throw new Error(`Mock file ${fileName}.json not found`);
        }
        return await response.json();
      } catch (error) {
        console.warn(`[BaseService] Mock failed for ${fileName}, falling back to real API if possible.`, error);
      }
    }

    const response = await request();
    return response.data;
  }
}
