import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const createCheckoutSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  variantId: z.string().optional(),
  successUrl: z.string().url("Valid success URL is required"),
  cancelUrl: z.string().url("Valid cancel URL is required"),
});

export class CreateCheckoutDto extends createZodDto(createCheckoutSchema) {
  // Explicit properties for better IDE and compiler support across packages
  planId!: string;
  variantId?: string;
  successUrl!: string;
  cancelUrl!: string;
}
