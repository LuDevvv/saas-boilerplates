"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useGsapReveal } from "@node-stack/ui";

// ─── Types ───────────────────────────────────────────────────────────────────

type BillingCycle = "monthly" | "annual";

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  priceLabel: string;
  annualLabel: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
  ctaHref: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 0,
    annualPrice: 0,
    priceLabel: "Free",
    annualLabel: "Free",
    description: "Perfect for side projects and early exploration.",
    features: [
      "3 projects",
      "Community support",
      "Basic analytics",
      "Public repos only",
    ],
    highlighted: false,
    cta: "Get started free",
    ctaHref: "#",
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 29,
    annualPrice: 23,
    priceLabel: "$29",
    annualLabel: "$23",
    description: "For teams shipping fast, with all the guardrails in place.",
    features: [
      "Unlimited projects",
      "Priority support",
      "Advanced analytics",
      "Private repos",
      "Custom domains",
      "2FA & SSO",
    ],
    highlighted: true,
    cta: "Start free trial",
    ctaHref: "#",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: null,
    annualPrice: null,
    priceLabel: "Custom",
    annualLabel: "Custom",
    description: "For organizations that need dedicated infrastructure and SLAs.",
    features: [
      "Everything in Pro",
      "Dedicated infrastructure",
      "Custom SLA",
      "24/7 account manager",
      "Custom RLS policies",
      "SAML SSO",
    ],
    highlighted: false,
    cta: "Contact sales",
    ctaHref: "#",
  },
];

// ─── Billing Toggle ───────────────────────────────────────────────────────────

interface BillingToggleProps {
  value: BillingCycle;
  onChange: (value: BillingCycle) => void;
}

function BillingToggle({ value, onChange }: BillingToggleProps) {
  return (
    <div
      className="inline-flex items-center gap-1 bg-neutral-100 p-1 rounded-full border border-neutral-200"
      role="group"
      aria-label="Billing cycle"
    >
      {(["monthly", "annual"] as BillingCycle[]).map((cycle) => (
        <button
          key={cycle}
          type="button"
          onClick={() => onChange(cycle)}
          className={[
            "px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
            value === cycle
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700",
          ].join(" ")}
          aria-pressed={value === cycle}
        >
          {cycle === "monthly" ? "Monthly" : "Annual"}
          {cycle === "annual" && (
            <span className="ml-1.5 text-xs font-semibold text-primary-600">
              −20%
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: Plan;
  billing: BillingCycle;
  index: number;
}

function PlanCard({ plan, billing, index }: PlanCardProps) {
  const ref = useGsapReveal<HTMLDivElement>({
    direction: "up",
    delay: index * 0.12,
    duration: 0.7,
  });

  const displayPrice =
    billing === "annual" ? plan.annualLabel : plan.priceLabel;
  const suffix =
    plan.monthlyPrice !== null && plan.monthlyPrice > 0 ? "/mo" : "";

  return (
    <div
      ref={ref}
      className={[
        "relative flex flex-col rounded-2xl p-6 lg:p-8 transition-all duration-300",
        plan.highlighted
          ? "bg-white ring-2 ring-primary-500 shadow-glow scale-[1.03] z-10"
          : "bg-white border border-neutral-200 shadow-sm",
      ].join(" ")}
    >
      {/* Most Popular badge */}
      {plan.highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-600 text-white shadow-sm whitespace-nowrap">
            Most Popular
          </span>
        </div>
      )}

      {/* Plan header */}
      <div className="mb-6">
        <h3 className="font-display font-bold text-lg text-neutral-900">
          {plan.name}
        </h3>
        <p className="text-neutral-500 text-sm mt-1">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-end gap-1">
          <span className="font-display font-black text-4xl text-neutral-900 transition-all duration-300">
            {displayPrice}
          </span>
          {suffix && (
            <span className="text-neutral-400 text-sm mb-1">{suffix}</span>
          )}
        </div>
        {billing === "annual" && plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
          <p className="text-xs text-neutral-400 mt-1">
            Billed annually · saves{" "}
            <span className="text-primary-600 font-medium">
              ${((plan.monthlyPrice - plan.annualPrice!) * 12).toFixed(0)}/yr
            </span>
          </p>
        )}
      </div>

      {/* CTA */}
      <a
        href={plan.ctaHref}
        className={[
          "w-full text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 mb-6",
          plan.highlighted
            ? "bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
            : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400",
        ].join(" ")}
      >
        {plan.cta}
      </a>

      {/* Feature list */}
      <ul className="flex flex-col gap-3">
        {plan.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5 text-sm text-neutral-600">
            <Check
              className="w-4 h-4 text-primary-500 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            {feat}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function PricingSection() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const headingRef = useGsapReveal<HTMLDivElement>({ direction: "up", delay: 0, duration: 0.7 });

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="section bg-neutral-50"
    >
      <div className="container">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-12">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2
            id="pricing-heading"
            className="font-display font-bold text-3xl sm:text-4xl text-neutral-900"
          >
            Transparent{" "}
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="mt-4 text-neutral-500 text-lg max-w-lg mx-auto">
            One codebase, no license fees. Pay only for the plan that fits your scale.
          </p>

          {/* Toggle */}
          <div className="mt-8 flex justify-center">
            <BillingToggle value={billing} onChange={setBilling} />
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} billing={billing} index={i} />
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-neutral-400 mt-10">
          All plans include the full source code under the MIT license. No hidden fees.
        </p>
      </div>
    </section>
  );
}
