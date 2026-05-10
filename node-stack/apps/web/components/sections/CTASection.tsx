"use client";

import { useState, type FormEvent } from "react";
import { useGsapReveal } from "@node-stack/ui";

// ─── Types ───────────────────────────────────────────────────────────────────

type FormState = "idle" | "submitting" | "success" | "error";

interface SocialAvatar {
  initials: string;
  color: string;
  label: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const SOCIAL_AVATARS: SocialAvatar[] = [
  { initials: "JL", color: "bg-primary-600", label: "JL" },
  { initials: "MP", color: "bg-violet-600", label: "MP" },
  { initials: "AR", color: "bg-emerald-600", label: "AR" },
  { initials: "SK", color: "bg-amber-500", label: "SK" },
];

// ─── Overlapping avatars ──────────────────────────────────────────────────────

function AvatarStack() {
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2.5" aria-hidden="true">
        {SOCIAL_AVATARS.map((avatar) => (
          <div
            key={avatar.label}
            className={[
              avatar.color,
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-primary-700",
            ].join(" ")}
          >
            {avatar.initials}
          </div>
        ))}
      </div>
      <p className="ml-3 text-primary-200 text-sm">
        Join{" "}
        <span className="font-semibold text-white">500+</span> developers already building
      </p>
    </div>
  );
}

// ─── Success message ─────────────────────────────────────────────────────────

function SuccessMessage() {
  return (
    <div
      className="flex flex-col items-center gap-3 py-4"
      role="status"
      aria-live="polite"
    >
      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-white font-semibold text-lg">You&apos;re on the list!</p>
      <p className="text-primary-200 text-sm max-w-xs text-center">
        We&apos;ll reach out when early access opens. Keep an eye on your inbox.
      </p>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function CTASection() {
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");

  const contentRef = useGsapReveal<HTMLDivElement>({
    direction: "up",
    delay: 0,
    duration: 0.8,
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email || formState === "submitting") return;

    setFormState("submitting");

    // TODO: Replace with real API call or Server Action
    await new Promise<void>((resolve) => setTimeout(resolve, 800));
    setFormState("success");
  }

  return (
    <section
      aria-labelledby="cta-heading"
      className="section bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden"
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary-900/40 blur-3xl"
        aria-hidden="true"
      />

      {/* Dot grid overlay */}
      <div
        className="dot-grid absolute inset-0 opacity-10 pointer-events-none"
        aria-hidden="true"
      />

      <div className="container relative z-10">
        <div ref={contentRef} className="max-w-2xl mx-auto text-center flex flex-col items-center gap-8">
          {/* Eyebrow */}
          <p className="text-primary-200 text-sm font-semibold uppercase ">
            Early access
          </p>

          {/* Heading */}
          <div>
            <h2
              id="cta-heading"
              className="font-display font-black text-4xl sm:text-5xl text-white leading-tight"
            >
              Ready to launch your SaaS?
            </h2>
            <p className="mt-4 text-primary-200 text-lg max-w-lg mx-auto">
              Get the production-ready foundation so you can focus on your product — not the plumbing.
            </p>
          </div>

          {/* Form / Success */}
          {formState === "success" ? (
            <SuccessMessage />
          ) : (
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-md flex flex-col sm:flex-row gap-3"
              noValidate
              aria-label="Early access sign-up form"
            >
              <label htmlFor="cta-email" className="sr-only">
                Email address
              </label>
              <input
                id="cta-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={formState === "submitting"}
                className="flex-1 bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-700 disabled:opacity-60 transition-opacity"
              />
              <button
                type="submit"
                disabled={formState === "submitting" || !email}
                className="bg-white text-primary-700 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-neutral-50 active:bg-neutral-100 transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 disabled:opacity-60"
              >
                {formState === "submitting" ? "Sending…" : "Get Early Access"}
              </button>
            </form>
          )}

          {/* Social proof */}
          <AvatarStack />
        </div>
      </div>
    </section>
  );
}
