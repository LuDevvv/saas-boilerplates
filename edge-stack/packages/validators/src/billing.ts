import { z } from "./zod";

/**
 * Validation schema for initiating a checkout session.
 */
export const checkoutRequestSchema = z
  .object({
    productId: z.string().min(1),
    workspaceId: z.string().uuid(),
    redirectUrl: z.string().url().optional(),
  })
  .openapi("CheckoutRequest");

/**
 * Schema for success payload of checkout session creation.
 */
export const checkoutResponseDataSchema = z
  .object({
    url: z.string().url(),
  })
  .openapi("CheckoutResponseData");

/**
 * Standard success response schema for checkout requests.
 */
export const checkoutSuccessResponseSchema = z
  .object({
    success: z.boolean().default(true),
    data: checkoutResponseDataSchema,
  })
  .openapi("CheckoutSuccessResponse");

/**
 * Schema for Polar.sh Webhook Payload validation.
 */
export const PolarWebhookSchema = z.object({
  type: z.string(),
  data: z.any(),
});

/**
 * Schema for success payload of customer portal URL request.
 */
export const portalResponseDataSchema = z
  .object({
    url: z.string().url(),
  })
  .openapi("PortalResponseData");

export const portalSuccessResponseSchema = z
  .object({
    success: z.boolean().default(true),
    data: portalResponseDataSchema,
  })
  .openapi("PortalSuccessResponse");

/**
 * Schema for subscription status feedback.
 */
export const subscriptionStatusSchema = z
  .object({
    hasActiveSubscription: z.boolean(),
    subscription: z
      .object({
        id: z.string().uuid(),
        planId: z.string(),
        variantId: z.string(),
        status: z.string(),
        nextPaymentAt: z.string().nullable(),
        endsAt: z.string().nullable(),
      })
      .nullable(),
  })
  .openapi("SubscriptionStatusData");

export const subscriptionStatusResponseSchema = z
  .object({
    success: z.boolean().default(true),
    data: subscriptionStatusSchema,
  })
  .openapi("SubscriptionStatusResponse");

export type CheckoutRequestDTO = z.infer<typeof checkoutRequestSchema>;
export type CheckoutResponseDTO = z.infer<typeof checkoutResponseDataSchema>;
export type PolarWebhookData = z.infer<typeof PolarWebhookSchema>;
export type PortalResponseDTO = z.infer<typeof portalResponseDataSchema>;
export type SubscriptionStatusDTO = z.infer<typeof subscriptionStatusSchema>;

/**
 * Standard schema for an individual invoice.
 */
export const InvoiceSchema = z
  .object({
    id: z.string(),
    number: z.string(),
    amount: z.number(),
    currency: z.string(),
    status: z.string(),
    createdAt: z.string(),
    hostedInvoiceUrl: z.string().url().nullable().optional(),
  })
  .openapi("Invoice");

/**
 * Success response for fetching the billing history/invoices.
 */
export const InvoiceListSuccessResponseSchema = z
  .object({
    success: z.boolean().default(true),
    data: z.array(InvoiceSchema),
  })
  .openapi("InvoiceListSuccessResponse");
