// Legacy types kept for backward compatibility - should be migrated to shared packages

export enum PaymentMethodType {
  CARD = "card",
  OXXO = "oxxo",
  PAYPAL = "paypal",
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  CANCELED = "canceled",
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
  PAST_DUE = "past_due",
  TRIALING = "trialing",
  UNPAID = "unpaid",
  PAUSED = "paused",
  PENDING = "pending",
  INACTIVE = "INACTIVE",
}
