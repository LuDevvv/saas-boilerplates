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
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  date: string;
  invoiceUrl: string;
  pdfUrl: string;
}

export type InvoicesResponse = PaginatedResponse<Invoice>;
