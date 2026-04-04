import { z } from "./zod";

/**
 * Schema for dashboard summary metrics.
 * Maps 1:1 with the response from getDashboardMetrics repository method.
 */
export const dashboardMetricsSchema = z
  .object({
    teamMembers: z.number(),
    totalTasks: z.number(),
    subscriptionStatus: z.string().nullable(),
    usage: z.array(
      z.object({
        metricName: z.string(),
        currentUsage: z.number(),
        quotaLimit: z.number(),
      }),
    ),
  })
  .openapi("DashboardMetrics");

/**
 * Standard success response schema for metrics data.
 */
export const dashboardMetricsResponseSchema = z
  .object({
    success: z.boolean().default(true),
    data: dashboardMetricsSchema,
  })
  .openapi("DashboardMetricsResponse");

export type DashboardMetricsDTO = z.infer<typeof dashboardMetricsSchema>;
