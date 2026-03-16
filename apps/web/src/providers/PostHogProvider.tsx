import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import React, { useEffect } from "react";

// Initialize PostHog client-side
if (typeof window !== "undefined") {
  /*
    posthog.init(
        import.meta.env.PUBLIC_POSTHOG_KEY ?? '',
        {
            api_host: import.meta.env.PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
            capture_pageview: false, // We handle this manually for more control
            persistence: 'localStorage',
            autocapture: true,
        }
    );
    */
}

/**
 * PostHogProvider component to wrap the application and handle analytics.
 * Automatically tracks pageviews and handles user identification.
 */
export const PostHogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    // Basic pageview tracking on component mount (client-side)
    if (typeof window !== "undefined") {
      // posthog.capture('$pageview');
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
};

/**
 * Utility to identify user in PostHog upon login/session start.
 */
export const identifyUser = (
  userId: string,
  email: string,
  properties: Record<string, any> = {},
) => {
  // Basic guard to prevent errors if PH is not used
  if (typeof window !== "undefined") {
    try {
      // posthog.identify(userId, { email, ...properties });
    } catch (e) {
      console.warn("PostHog identify failed (likely disabled)");
    }
  }
};
