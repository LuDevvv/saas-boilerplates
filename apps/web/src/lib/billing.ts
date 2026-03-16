import type { Plan } from "../components/billing/PricingCard";

/**
 * SaaS pricing tiers definition.
 * Product IDs map to provider variant/product identifiers configured server-side.
 * Replace placeholder IDs with real provider values before going live.
 */
export const PRICING_PLANS: Plan[] = [
  {
    id: "free",
    name: "Starter",
    description:
      "For individuals exploring the platform. No credit card required.",
    price: "$0",
    duration: "/month",
    features: [
      "Up to 2 projects",
      "Basic analytics & reporting",
      "Community support",
      "1 GB storage",
    ],
    productId: null,
    isPopular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professionals and small teams scaling fast.",
    price: "$19",
    duration: "/month",
    features: [
      "Unlimited projects",
      "Advanced analytics & insights",
      "Priority email support",
      "50 GB storage",
      "Custom domains",
      "API access",
    ],
    productId: "952f0800-2cb7-4f6f-8554-4ee33b42d045",
    isPopular: true,
  },
  {
    id: "business",
    name: "Business",
    description: "For organizations that need enterprise-grade control.",
    price: "$99",
    duration: "/month",
    features: [
      "Everything in Pro",
      "SSO / SAML authentication",
      "Dedicated Slack channel",
      "1 TB storage",
      "99.9% uptime SLA",
      "Audit logs & compliance",
    ],
    productId: "variant_biz_001",
    isPopular: false,
  },
];
