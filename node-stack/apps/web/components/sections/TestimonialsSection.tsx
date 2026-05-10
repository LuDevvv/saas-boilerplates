"use client";

import { useGsapReveal } from "@node-stack/ui";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  avatarColor: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The RLS setup alone saved us weeks. We had multi-tenant isolation working in hours.",
    name: "Alex Chen",
    role: "CTO",
    company: "Buildfast",
    initials: "AC",
    avatarColor: "bg-primary-600",
  },
  {
    quote:
      "Finally a boilerplate that doesn't cut corners on security. 2FA, audit logs, everything.",
    name: "Sarah Kim",
    role: "Founder",
    company: "Shipfast",
    initials: "SK",
    avatarColor: "bg-violet-600",
  },
  {
    quote:
      "Generated the API client from the OpenAPI spec and it just worked. Incredible DX.",
    name: "Marco Rivera",
    role: "Lead Dev",
    company: "Scalely",
    initials: "MR",
    avatarColor: "bg-emerald-600",
  },
];

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating() {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="w-4 h-4 text-amber-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Testimonial Card ────────────────────────────────────────────────────────

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  const ref = useGsapReveal<HTMLDivElement>({
    direction: "up",
    delay: index * 0.1,
    duration: 0.7,
  });

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-200 flex flex-col gap-4"
    >
      <StarRating />

      <blockquote className="text-neutral-700 text-sm leading-relaxed flex-1">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
        {/* Initials avatar */}
        <div
          className={`${testimonial.avatarColor} rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold text-white shrink-0 select-none`}
          aria-hidden="true"
        >
          {testimonial.initials}
        </div>

        <div className="min-w-0">
          <p className="text-neutral-900 font-semibold text-sm leading-tight truncate">
            {testimonial.name}
          </p>
          <p className="text-neutral-400 text-xs leading-tight truncate">
            {testimonial.role} @ {testimonial.company}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function TestimonialsSection() {
  const headingRef = useGsapReveal<HTMLDivElement>({ direction: "up", delay: 0, duration: 0.7 });

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="section bg-white"
    >
      <div className="container">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-14">
          <p className="text-sm font-semibold text-primary-600 uppercase  mb-3">
            Social proof
          </p>
          <h2
            id="testimonials-heading"
            className="font-display font-bold text-3xl sm:text-4xl text-neutral-900"
          >
            Loved by{" "}
            <span className="gradient-text">developers</span>
          </h2>
          <p className="mt-4 text-neutral-500 text-lg max-w-lg mx-auto">
            Join hundreds of teams shipping faster and more securely with NodeStack.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} testimonial={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
