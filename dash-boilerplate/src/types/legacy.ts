// TODO: These should eventually be moved to azteli-api-client

export enum PaymentMethodType {
  CARD = "card",
  OXXO = "oxxo",
  PAYPAL = "paypal",
}

// Re-export SubscriptionStatus as value (it's exported as type in the library)
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
