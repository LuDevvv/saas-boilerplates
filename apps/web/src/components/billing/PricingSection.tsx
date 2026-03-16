import { useState } from "react";
import { useCheckout } from "../../hooks/useCheckout";
import { PRICING_PLANS } from "../../lib/billing";
import { PricingCard, type Plan } from "./PricingCard";
import { Activity } from "lucide-react";

/**
 * Orchestrator component for the pricing grid.
 * Manages checkout state across all pricing cards and renders a responsive layout.
 */
export function PricingSection() {
  const { checkout, isLoading, error } = useCheckout();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const handleSubscribe = async (plan: Plan) => {
    if (!plan.productId) {
      // Free tier — no checkout needed
      return;
    }
    setSelectedPlanId(plan.id);
    await checkout(plan.productId);
    setSelectedPlanId(null);
  };

  return (
    <section
      className="w-full max-w-6xl mx-auto py-24"
      aria-labelledby="pricing-heading"
    >
      {/* Header */}
      <div className="text-center mb-24">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#F1F3F6]" />
          <span className="text-[10px] font-black text-[#16C8C7] uppercase tracking-[0.4em] flex items-center gap-2">
            <Activity className="w-3 h-3 animate-pulse" />
            Infrastructure Access
          </span>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#F1F3F6]" />
        </div>
        <h2
          id="pricing-heading"
          className="text-5xl font-black tracking-tighter text-premium-gradient italic leading-none"
        >
          Provision Your Protocol
        </h2>
        <p className="mt-8 text-lg text-[#8E95A2] font-semibold max-w-2xl mx-auto leading-relaxed italic">
          Select a resource allocation plan tailored for your operational
          requirements. Linear scaling, zero configuration overhead.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">
        {PRICING_PLANS.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            isLoading={isLoading}
            isProcessing={isLoading && selectedPlanId === plan.id}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>

      {/* Contextual Error Banner */}
      {error && (
        <div
          role="alert"
          className="mt-12 p-6 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest rounded-2xl mx-auto max-w-lg text-center border border-red-100 shadow-xl shadow-red-500/5 animate-in slide-in-from-top-4"
        >
          Protocol Error: {error}
        </div>
      )}
    </section>
  );
}
