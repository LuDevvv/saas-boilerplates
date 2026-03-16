import type { Bindings } from "../types/env";

/**
 * Service for server-side product analytics using PostHog ingest API.
 * Optimized for Edge runtimes using native fetch.
 */
export const createAnalyticsService = (env: Bindings) => {
  const apiKey = env.POSTHOG_API_KEY;
  const host = env.POSTHOG_HOST || "https://app.posthog.com";
  /**
   * Captures a server-side event for a given user.
   *
   * @param event - Event name (e.g., 'workspace_created')
   * @param distinctId - Unique user or session ID
   * @param properties - Metadata associated with the event
   */
  const captureEvent = async (
    event: string,
    distinctId: string,
    properties: Record<string, any> = {},
  ) => {
    if (!apiKey) return;

    try {
      await fetch(`${host}/capture/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: apiKey,
          event,
          properties: {
            ...properties,
            distinct_id: distinctId,
            $lib: "startup-edge-stack-api",
            $server_timestamp: new Date().toISOString(),
          },
        }),
      });
    } catch (err) {
      // Fail silently for analytics to prevent blocking core logic
      console.error("PostHog Analytics Failure:", err);
    }
  };

  /**
   * Connects a distinct ID to a specific user's identity.
   */
  const identify = async (
    userId: string,
    properties: Record<string, any> = {},
  ) => {
    await captureEvent("$identify", userId, { $set: properties });
  };

  return {
    captureEvent,
    identify,

    // Domain-specific events for cleaner integration
    trackLogin: (userId: string, email: string) =>
      captureEvent("login_success", userId, { email }),
    trackRegistration: (userId: string, email: string) =>
      captureEvent("registration_complete", userId, { email }),
    trackWorkspaceCreated: (
      userId: string,
      workspaceId: string,
      name: string,
    ) =>
      captureEvent("workspace_created", userId, {
        workspaceId,
        workspaceName: name,
      }),
  };
};

export type AnalyticsService = ReturnType<typeof createAnalyticsService>;
