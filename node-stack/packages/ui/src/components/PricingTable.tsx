"use client";

import * as React from "react";

import { cn } from "../utils.js";
import { Button } from "./ui/Button.js";
import { useGsapReveal } from "../hooks/use-gsap-reveal.js";

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export interface PricingTableProps {
  tiers: PricingTier[];
  className?: string;
}

export function PricingTable({ tiers, className }: PricingTableProps): React.JSX.Element {
  const containerRef = useGsapReveal<HTMLDivElement>({ direction: "up", distance: 30 });

  return (
    <div 
      ref={containerRef}
      className={cn("grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3", className)}
    >
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className={cn(
            "group flex flex-col rounded-3xl border p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card text-card-foreground",
            tier.highlighted
              ? "border-primary ring-1 ring-primary"
              : "border-border"
          )}
        >
          <div className="mb-8">
            <h3 className="text-xl font-heading">{tier.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-kpi">{tier.price}</span>
              {tier.price !== "Free" && <span className="text-base font-label text-muted-foreground">/mo</span>}            </div>
          </div>
          <ul className="mb-8 flex-1 space-y-4">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            variant={tier.highlighted ? "primary" : "outline"}
            className="w-full"
            size="lg"
          >
            {tier.cta}
          </Button>
        </div>
      ))}
    </div>
  );
}
