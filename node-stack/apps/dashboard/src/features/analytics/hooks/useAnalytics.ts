import type { AnalyticsOverview, TrafficData, PageStat, UsageData } from "@node-stack/types";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";

export const useAnalyticsOverview = (workspaceId: string) => {
  return useQuery<AnalyticsOverview, Error>({
    queryKey: queryKeys.analytics.overview(workspaceId),
    queryFn: () => api.analytics.getOverview(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useAnalyticsTraffic = (workspaceId: string) => {
  return useQuery<TrafficData[], Error>({
    queryKey: queryKeys.analytics.traffic(workspaceId),
    queryFn: () => api.analytics.getTraffic(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useAnalyticsPages = (workspaceId: string) => {
  return useQuery<PageStat[], Error>({
    queryKey: queryKeys.analytics.pages(workspaceId),
    queryFn: () => api.analytics.getPages(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useAnalyticsUsage = (workspaceId: string) => {
  return useQuery<UsageData, Error>({
    queryKey: queryKeys.analytics.usage(workspaceId),
    queryFn: () => api.analytics.getUsage(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useGlobalAdminStats = () => {
  return useQuery({
    queryKey: queryKeys.admin.globalStats(),
    queryFn: () => api.analytics.getGlobalAdminStats(),
  });
};
