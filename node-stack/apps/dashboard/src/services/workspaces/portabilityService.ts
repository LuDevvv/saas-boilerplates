import { BaseService } from '../baseService';

export interface PortabilityRequest {
  id: string;
  workspaceId: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

class PortabilityService extends BaseService {
  constructor() {
    super('/portability');
  }

  async getRequests(workspaceId: string): Promise<PortabilityRequest[]> {
    return this.get<PortabilityRequest[]>(`?workspaceId=${workspaceId}`);
  }

  async getRequestById(requestId: string): Promise<PortabilityRequest> {
    return this.get<PortabilityRequest>(`/${requestId}`);
  }

  async createRequest(workspaceId: string): Promise<PortabilityRequest> {
    return this.post<PortabilityRequest>('', { workspaceId });
  }
}

export const portabilityService = new PortabilityService();
