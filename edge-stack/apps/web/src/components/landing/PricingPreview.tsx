import React from "react";
import { Check, ArrowRight, Shield, Zap, Crown, Activity } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui";

const plans = [
  {
    name: "Hobby Protocol",
    price: "$0",
    description: "Perfect for side projects and learning isolates.",
    features: [
      "1 Primary Workspace",
      "3 Verified Members",
      "100 API Calls/day",
      "Standard Latency",
    ],
    cta: "Initialize Free Node",
    popular: false,
    icon: <Zap className="w-5 h-5 text-[#8E95A2]" />,
  },
  {
    name: "Startup Cluster",
    price: "$29",
    description: "Ideal for growing businesses and SaaS nodes.",
    features: [
      "5 Isolated Workspaces",
      "10 Verified Members",
      "Unlimited API Calls",
      "Priority Edge Support",
      "Custom Domains",
    ],
    cta: "Scale Infrastructure",
    popular: true,
    icon: <Crown className="w-5 h-5 text-[hsl(var(--brand-primary))]" />,
  },
  {
    name: "Enterprise Grid",
    price: "Custom",
    description: "Infinite scale for high-demand apps.",
    features: [
      "Unlimited everything",
      "99.99% SLA Guarantees",
      "Dedicated Architect",
      "SSO & Audit Logs",
      "White-labeling",
    ],
    cta: "Contact Operations",
    popular: false,
    icon: <Shield className="w-5 h-5 text-[#8E95A2]" />,
  },
];

export function PricingPreview() {
  return (
    <section
      id="pricing"
      className="py-32 bg-[#F8F9FB] border-y border-[#F1F3F6]"
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20 space-y-4 animate-premium-in">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-[#E1E5EB]" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C1C7D0] italic">
              Resource Allocation
            </p>
            <div className="h-[1px] w-8 bg-[#E1E5EB]" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-[#1A1D1F] tracking-tighter italic leading-none">
            PREDICTABLE <span className="text-premium-gradient">PRICING.</span>
          </h2>
          <p className="text-lg text-[#8E95A2] font-semibold italic">
            Simple plans for every stage of your journey. High-integrity
            execution, no hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className="animate-premium-in"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <Card
                className={`flex flex-col relative dashboard-card border-none h-full transition-all duration-500 overflow-hidden ${
                  plan.popular
                    ? "shadow-2xl shadow-black/10 scale-105 md:z-10 bg-white ring-2 ring-[hsl(var(--brand-primary))/20]"
                    : "bg-white/50 shadow-xl shadow-black/[0.02]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 py-2 px-12 bg-[hsl(var(--brand-primary))] text-white text-[9px] font-black uppercase tracking-[0.3em] italic rotate-45 translate-x-10 translate-y-3 shadow-lg">
                    Recommended
                  </div>
                )}

                <CardHeader className="p-10 pb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#F8F9FB] border border-[#F1F3F6] flex items-center justify-center shadow-sm">
                      {plan.icon}
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C1C7D0] italic mb-1">
                        Cost / Month
                      </p>
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-3xl font-black italic tracking-tighter text-[#1A1D1F]">
                          {plan.price}
                        </span>
                        {plan.price !== "Custom" && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#8E95A2]">
                            USD
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-black italic tracking-tighter text-[#1A1D1F]">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="pt-2 text-sm text-[#8E95A2] font-semibold italic min-h-[48px]">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 px-10">
                  <div className="h-[1px] w-full bg-[#F1F3F6] mb-8" />
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-[#1A1D1F] font-semibold italic"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#16C8C7]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check
                            className="w-3 h-3 text-[#16C8C7]"
                            strokeWidth={3}
                          />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-10 pt-8">
                  <a href="/register" className="w-full">
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      className={`w-full h-16 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all duration-500 shadow-xl ${
                        plan.popular
                          ? "bg-[#1A1D1F] hover:bg-black text-white border-none"
                          : "bg-white hover:bg-[#F8F9FB] border-[#F1F3F6] text-[#1A1D1F]"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight
                        className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
                        strokeWidth={3}
                      />
                    </Button>
                  </a>
                </CardFooter>

                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#F1F3F6] to-transparent opacity-50" />
              </Card>
            </div>
          ))}
        </div>

        <div
          className="mt-20 flex flex-col items-center animate-premium-in"
          style={{ animationDelay: "600ms" }}
        >
          <div className="flex items-center gap-4 text-[#C1C7D0]">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">
              ISO-9001 COMPLIANT ARCHITECTURE
            </span>
            <Activity className="w-4 h-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
