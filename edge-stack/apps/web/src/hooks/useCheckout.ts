import { useState } from "react";
import { BillingService } from "../services/billing.service";
import { useWorkspace } from "./useWorkspace";
import { toast } from "sonner";

/**
 * Hook for managing the checkout flow.
 * Handles API communication, loading states, error toasts, and browser redirection.
 */
export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeWorkspaceId } = useWorkspace();

  const checkout = async (variantId: string) => {
    if (!activeWorkspaceId) {
      toast.error("No active workspace selected.");
      setError("No active workspace selected.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await BillingService.createCheckout(
        activeWorkspaceId,
        variantId,
      );

      if (result.success && result.data?.url) {
        // Redirect to provider-hosted checkout page
        window.location.href = result.data.url;
      } else {
        throw new Error("Invalid checkout URL received from provider.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      toast.error("Checkout Failed", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { checkout, isLoading, error };
}
