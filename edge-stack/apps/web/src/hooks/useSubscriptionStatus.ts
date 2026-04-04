import { useState, useEffect, useCallback } from "react";
import { BillingService } from "../services/billing.service";
import { useWorkspace } from "./useWorkspace";
import type { ISubscription } from "../types";

/**
 * Hook for fetching the current workspace's subscription status.
 * Automatically refetches when the active workspace changes.
 */
export function useSubscriptionStatus() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscription, setSubscription] = useState<ISubscription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { activeWorkspaceId } = useWorkspace();

  const fetchStatus = useCallback(async () => {
    if (!activeWorkspaceId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await BillingService.getSubscriptionStatus();
      setHasActiveSubscription(data.hasActiveSubscription);
      setSubscription(data.subscription);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      setHasActiveSubscription(false);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    isLoading,
    hasActiveSubscription,
    subscription,
    error,
    refetch: fetchStatus,
  };
}
