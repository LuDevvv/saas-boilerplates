import { PaginatedResponse } from "./domain/entities.js";

export type CreateCheckoutDto = Record<string, unknown>;

export interface CheckoutResponse {
  id: string;
  url: string;
}

export interface PortalResponse {
  url: string;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  productName?: string;
  invoiceUrl?: string;
  pdfUrl?: string;
}

export type InvoicesResponse = PaginatedResponse<Invoice>;

export interface BillingSubscription {
  id: string;
  status: string;
  planId: string;
  planName: string;
  interval: "monthly" | "yearly";
  polarProductId?: string;
  variantId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAt?: string;
  endsAt?: string;
  workspaceId: string;
}

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  trialDays: number;
  features: string[];
}

export interface ChangePlanDto {
  planId: string;
  variantId?: string;
}
