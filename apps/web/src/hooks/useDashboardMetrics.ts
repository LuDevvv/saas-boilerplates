import { useState, useEffect, useCallback } from "react";
import { MetricsService } from "../services/metrics.service";
import { useWorkspace } from "./useWorkspace";
import type { IDashboardMetrics } from "../types";

/**
 * Hook for fetching real-time dashboard metrics scoped to the active workspace.
 * Automatically refetches when the active workspace changes.
 */
export function useDashboardMetrics() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<IDashboardMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { activeWorkspaceId } = useWorkspace();

  const fetchMetrics = useCallback(async () => {
    if (!activeWorkspaceId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await MetricsService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      setMetrics(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    isLoading,
    metrics,
    error,
    refetch: fetchMetrics,
  };
}
