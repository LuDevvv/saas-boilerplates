import { useState } from "react";
import { BillingService } from "../services/billing.service";
import { useWorkspace } from "./useWorkspace";
import { toast } from "sonner";

/**
 * Hook for generating and redirecting to the customer billing portal.
 */
export function useCustomerPortal() {
  const [isLoading, setIsLoading] = useState(false);
  const { activeWorkspaceId } = useWorkspace();

  const openPortal = async () => {
    if (!activeWorkspaceId) {
      toast.error("No active workspace selected.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await BillingService.getCustomerPortal();

      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        throw new Error("Invalid portal URL received.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error("Portal Error", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return { openPortal, isLoading };
}
