"use client";

import { useEffect, useRef } from "react";
import { animate } from "@motionone/dom";
import { useGsapReveal } from "@node-stack/ui";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Step {
  number: number;
  title: string;
  description: string;
  code: string;
}

// ─── Data ───────────────────────────────────────────────────────────────────

const STEPS: Step[] = [
  {
    number: 1,
    title: "Clone & Install",
    description:
      "Clone the repository and install all workspace dependencies in one command.",
    code: "git clone https://github.com/yourorg/nodestack.git\ncd nodestack && pnpm install",
  },
  {
    number: 2,
    title: "Configure & Migrate",
    description:
      "Copy the environment template, fill in your secrets, then migrate the database.",
    code: "cp .env.example .env\n# fill in DATABASE_URL, JWT_SECRET, etc.\npnpm db:migrate",
  },
  {
    number: 3,
    title: "Deploy",
    description:
      "All 4 apps — api, web, dashboard, and worker — are production-ready out of the box.",
    code: "# api, web, dashboard, worker — all ready\npnpm build\npnpm start",
  },
];

// ─── Connector Line ──────────────────────────────────────────────────────────

function DashedConnector() {
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const svg = svgRef.current;
    if (!path || !svg) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = String(length);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          animate(
            path,
            { strokeDashoffset: [length, 0] },
            { duration: 1.2, easing: [0.16, 1, 0.3, 1], delay: 0.4 }
          );
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="hidden lg:flex items-center justify-center absolute top-10 left-0 right-0 z-0 pointer-events-none"
      aria-hidden="true"
    >
      <svg
        ref={svgRef}
        width="100%"
        height="24"
        viewBox="0 0 800 24"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          ref={pathRef}
          d="M 160 12 H 640"
          stroke="#cbd5e1"
          strokeWidth="2"
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
        {/* Arrow tips at one-third and two-thirds */}
        <polyline
          points="310,6 320,12 310,18"
          stroke="#cbd5e1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <polyline
          points="480,6 490,12 480,18"
          stroke="#cbd5e1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

// ─── Step Card ──────────────────────────────────────────────────────────────

function StepCard({ step, index }: { step: Step; index: number }) {
  const ref = useGsapReveal<HTMLDivElement>({
    direction: "up",
    delay: index * 0.15,
    duration: 0.7,
  });

  return (
    <div
      ref={ref}
      className="relative z-10 flex flex-col gap-4 bg-white rounded-2xl border border-neutral-200 p-6 shadow-md flex-1"
    >
      {/* Gradient number */}
      <span
        className="gradient-text font-display font-black text-7xl leading-none select-none"
        aria-hidden="true"
      >
        {step.number}
      </span>

      <div className="flex flex-col gap-1">
        <h3 className="text-neutral-900 font-semibold text-lg">{step.title}</h3>
        <p className="text-neutral-500 text-sm leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* Code block */}
      <pre className="bg-neutral-900 rounded-xl p-4 font-mono text-sm text-emerald-400 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
        <code>{step.code}</code>
      </pre>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function HowItWorksSection() {
  const headingRef = useGsapReveal<HTMLDivElement>({ direction: "up", delay: 0, duration: 0.7 });

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="section bg-neutral-50"
    >
      <div className="container">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-16">
          <p className="text-sm font-semibold text-primary-600 uppercase  mb-3">
            Quick start
          </p>
          <h2
            id="how-it-works-heading"
            className="font-display font-bold text-3xl sm:text-4xl text-neutral-900"
          >
            Up and running in{" "}
            <span className="gradient-text">3 steps</span>
          </h2>
          <p className="mt-4 text-neutral-500 text-lg max-w-xl mx-auto">
            From zero to a fully functional multi-tenant SaaS in minutes, not days.
          </p>
        </div>

        {/* Steps grid with connector */}
        <div className="relative">
          <DashedConnector />
          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            {STEPS.map((step, i) => (
              <StepCard key={step.number} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
