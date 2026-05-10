"use client";

import {
  Code2,
  Shield,
  Lock,
  Zap,
  ClipboardList,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useGsapReveal } from "@node-stack/ui";
import clsx from "clsx";

// ─── Feature data ─────────────────────────────────────────────

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  large?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: Code2,
    title: "Type-Safe API",
    description:
      "NestJS controllers + Drizzle ORM schemas generate an end-to-end type-safe SDK. Catch integration bugs at compile time, not in production.",
    large: true,
  },
  {
    icon: Shield,
    title: "Row-Level Security",
    description:
      "Zero-config multi-tenancy with Postgres RLS. Every query is automatically scoped to the right workspace — no accidental data leaks.",
  },
  {
    icon: Lock,
    title: "Auth Out of the Box",
    description:
      "JWT sessions, TOTP-based 2FA, and OAuth ready to go. Argon2id hashing and refresh-token rotation included.",
  },
  {
    icon: Zap,
    title: "Real-Time Ready",
    description:
      "BullMQ worker queues, Redis pub/sub channels, and a transactional Outbox pattern for reliable event delivery.",
  },
  {
    icon: ClipboardList,
    title: "Full Audit Trail",
    description:
      "A 26-action audit taxonomy logs every security-sensitive event inside the originating transaction — immutable by design.",
  },
  {
    icon: Sparkles,
    title: "AI-Ready",
    description:
      "Pluggable billing and AI adapters with usage metering. Swap providers without touching business logic.",
  },
];

// ─── Single feature card ──────────────────────────────────────

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useGsapReveal<HTMLDivElement>({
    direction: "up",
    delay: index * 0.06,
    duration: 0.6,
  });

  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className={clsx(
        "group relative flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6",
        "shadow-sm hover:shadow-md transition-shadow duration-300",
        feature.large && "gradient-border-card lg:col-span-2"
      )}
    >
      {/* Animated gradient accent for large card */}
      {feature.large && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden"
        >
          <div
            className="absolute -top-12 -right-12 h-48 w-48 rounded-full opacity-10 blur-2xl animate-float-blob"
            style={{ background: "var(--color-primary-500)" }}
          />
        </div>
      )}

      {/* Icon */}
      <span
        className={clsx(
          "inline-flex h-11 w-11 items-center justify-center rounded-xl",
          feature.large
            ? "bg-primary-100 text-primary-600"
            : "bg-neutral-100 text-neutral-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors duration-300"
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>

      {/* Text */}
      <div>
        <h3 className="mb-1.5 text-base font-semibold text-neutral-900">
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed text-neutral-500">
          {feature.description}
        </p>
      </div>

      {/* Large card extra badge */}
      {feature.large && (
        <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
          Core foundation
        </span>
      )}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────

function SectionHeading() {
  const ref = useGsapReveal<HTMLDivElement>({ direction: "up", delay: 0, duration: 0.7 });

  return (
    <div ref={ref} className="mb-12 text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-600">
        Built for production
      </p>
      <h2
        id="features-heading"
        className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
      >
        Everything you need to ship
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base text-neutral-500">
        Stop re-solving security, auth, and infrastructure. NodeStack gives you the production-grade foundation so your team can focus on what makes your product unique.
      </p>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="section bg-neutral-50/50"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
