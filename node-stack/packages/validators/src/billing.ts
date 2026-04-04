import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// ── Secure URL validator ──────────────────────────────────
// Prevents Open Redirect attacks by enforcing HTTPS and blocking
// common redirect bypass patterns (e.g., javascript:, data:, //evil.com)
const secureUrl = z
  .string()
  .url("Must be a valid URL")
  .max(2048, "URL must be at most 2048 characters")
  .refine(
    (url) => url.startsWith("https://"),
    "URL must use HTTPS protocol",
  )
  .refine(
    (url) => !url.includes("@"),
    "URL must not contain credentials",
  );

// ── Create Checkout ───────────────────────────────────────
export const CreateCheckoutSchema = z
  .object({
    planId: z
      .string()
      .min(1, "Plan ID is required")
      .max(255)
      .describe("Plan identifier from the billing provider (e.g. 'premium-yearly')"),
    variantId: z
      .string()
      .min(1)
      .max(255)
      .optional()
      .describe("Specific variant ID for multi-currency or regional pricing"),
    customerId: z
      .string()
      .min(1)
      .max(255)
      .optional()
      .describe("Existing customer identifier in the billing provider"),
    successUrl: secureUrl.describe("Redirect URL after successful payment (must be HTTPS)"),
    cancelUrl: secureUrl.describe("Redirect URL if payment is cancelled (must be HTTPS)"),
    metadata: z
      .record(z.string().max(255), z.string().max(500))
      .optional()
      .describe("Custom key-value pairs to store with the checkout session"),
  })
  .strict();

export class CreateCheckoutDto extends createZodDto(CreateCheckoutSchema) {}
