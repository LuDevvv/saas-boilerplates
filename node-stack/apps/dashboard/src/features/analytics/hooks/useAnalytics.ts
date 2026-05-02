import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { analyticsApi, type AnalyticsOverview, type TrafficData, type PageStat, type UsageData } from "../api/analytics.api";

export const useAnalyticsOverview = (workspaceId: string) => {
  return useQuery<AnalyticsOverview, Error>({
    queryKey: queryKeys.analytics.overview(workspaceId),
    queryFn: () => analyticsApi.getOverview(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useAnalyticsTraffic = (workspaceId: string) => {
  return useQuery<TrafficData[], Error>({
    queryKey: queryKeys.analytics.traffic(workspaceId),
    queryFn: () => analyticsApi.getTraffic(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useAnalyticsPages = (workspaceId: string) => {
  return useQuery<PageStat[], Error>({
    queryKey: queryKeys.analytics.pages(workspaceId),
    queryFn: () => analyticsApi.getPages(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useAnalyticsUsage = (workspaceId: string) => {
  return useQuery<UsageData, Error>({
    queryKey: queryKeys.analytics.usage(workspaceId),
    queryFn: () => analyticsApi.getUsage(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useGlobalAdminStats = () => {
  return useQuery({
    queryKey: queryKeys.admin.globalStats(),
    queryFn: () => analyticsApi.getGlobalAdminStats(),
  });
};
