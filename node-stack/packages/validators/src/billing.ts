import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ApiProperty } from "@nestjs/swagger";

export const createCheckoutSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  variantId: z.string().optional(),
  successUrl: z.string().url("Valid success URL is required"),
  cancelUrl: z.string().url("Valid cancel URL is required"),
});

export class CreateCheckoutDto extends createZodDto(createCheckoutSchema) {
  @ApiProperty({ example: "pro_plan_123", description: "The ID of the plan to subscribe to" })
  planId!: string;

  @ApiProperty({ example: "monthly", required: false, description: "Optional variant ID (e.g. monthly/yearly)" })
  variantId?: string;

  @ApiProperty({ example: "https://app.com/success", description: "URL to redirect after successful payment" })
  successUrl!: string;

  @ApiProperty({ example: "https://app.com/billing", description: "URL to redirect if payment is cancelled" })
  cancelUrl!: string;
}
