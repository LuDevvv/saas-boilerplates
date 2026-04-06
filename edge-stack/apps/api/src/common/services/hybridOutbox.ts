import type { Context } from "hono";
import type { AppContext } from "../types/env";

export interface HybridOutboxOptions {
  enabled?: boolean;
  fallbackCronMs?: number;
}

export const createHybridOutbox = (options: HybridOutboxOptions = {}) => {
  const { enabled = true, fallbackCronMs = 60000 } = options;

  return async (c: Context<AppContext>): Promise<void> => {
    if (!enabled) return;

    const { queue } = c.get("services");
    if (!queue) {
      console.warn("[HybridOutbox] Queue service not available");
      return;
    }

    try {
      await queue.dispatchOutboxPing();
      console.log("[HybridOutbox] Fast-track dispatch sent");
    } catch (error) {
      console.error("[HybridOutbox] Fast-track dispatch failed:", error);
    }
  };
};
