import { AxiosInstance } from "axios";
import { ExportRequest, ExportDownloadResponse } from "@node-stack/types";

export const portability = (client: AxiosInstance) => ({
  requestExport: async (workspaceId: string) => {
    const { data } = await client.post<{ data: ExportRequest }>(`/workspaces/${workspaceId}/portability`);
    return data.data ?? data;
  },

  listRequests: async (workspaceId: string) => {
    const { data } = await client.get<{ data: ExportRequest[] }>(`/workspaces/${workspaceId}/portability`);
    return data.data ?? data;
  },

  getRequest: async (workspaceId: string, requestId: string) => {
    const { data } = await client.get<{ data: ExportRequest }>(`/workspaces/${workspaceId}/portability/${requestId}`);
    return data.data ?? data;
  },

  getDownloadUrl: async (workspaceId: string, requestId: string) => {
    const { data } = await client.get<{ data: ExportDownloadResponse }>(`/workspaces/${workspaceId}/portability/${requestId}/download`);
    return data.data ?? data;
  },
});
