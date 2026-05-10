"use client";

import { useGsapReveal } from "@node-stack/ui";
import clsx from "clsx";

// ─── GitHub icon ──────────────────────────────────────────────
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={clsx("shrink-0", className)}
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

// ─── Stat item ────────────────────────────────────────────────
function StatItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium">
      <span className="text-primary-500">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

const HERO_WORDS = ["Build", "your", "SaaS"];

export function HeroSection() {
  const badgeRef = useGsapReveal<HTMLDivElement>({ direction: "up", delay: 0, duration: 0.7 });
  const ctaRef = useGsapReveal<HTMLDivElement>({ direction: "up", delay: 0.4, duration: 0.6 });
  const statsRef = useGsapReveal<HTMLDivElement>({ direction: "up", delay: 0.6, duration: 0.6 });
  const mockupRef = useGsapReveal<HTMLDivElement>({ direction: "up", delay: 0.3, duration: 0.8 });

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden section"
    >
      {/* Dot-grid background */}
      <div
        className="dot-grid pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
      />

      {/* Decorative blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-float-blob absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, var(--color-primary-400), transparent 70%)" }}
        />
        <div
          className="animate-float-blob-delayed absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, var(--color-primary-300), transparent 70%)" }}
        />
      </div>

      <div className="container relative mx-auto flex flex-col items-center text-center max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Badge */}
        <div ref={badgeRef}>
          <span className="animate-pulse-ring mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-100 px-3.5 py-1.5 text-xs font-semibold  text-primary-600 uppercase">
            Production-ready boilerplate ✦
          </span>
        </div>

        {/* H1 with word-by-word animation */}
        <h1
          id="hero-heading"
          className="mb-6 text-4xl font-bold  text-neutral-900 sm:text-5xl lg:text-6xl leading-tight"
        >
          {HERO_WORDS.map((word, i) => (
            <span
              key={word}
              className="word-animate mr-[0.25em] inline-block"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {word}
            </span>
          ))}
          {/* "faster" with gradient + its own timing */}
          <span
            className="word-animate gradient-text mr-[0.25em] inline-block"
            style={{ animationDelay: `${HERO_WORDS.length * 0.08}s` }}
          >
            faster
          </span>
          <span
            className="word-animate inline-block"
            style={{ animationDelay: `${(HERO_WORDS.length + 1) * 0.08}s` }}
          >
            than ever
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mb-10 max-w-xl text-lg text-neutral-500 leading-relaxed">
          A full-stack Node.js + Next.js boilerplate with auth, multi-tenancy, billing, audit logs, and background workers — ready in minutes, not months.
        </p>

        {/* CTA group */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center gap-3 mb-16">
          <a
            href="#pricing"
            className="inline-flex items-center justify-center rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-glow transition-all duration-200 hover:bg-primary-600 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
          >
            Start Building
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
          >
            <GitHubIcon className="h-4 w-4" />
            View on GitHub
          </a>
        </div>

        {/* Code window mockup */}
        <div ref={mockupRef} className="relative w-full max-w-3xl mx-auto mb-16">
          {/* Blobs behind the card */}
          <div aria-hidden="true" className="pointer-events-none absolute -inset-8 overflow-visible">
            <div
              className="animate-float-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-96 rounded-full opacity-10 blur-3xl"
              style={{ background: "var(--color-primary-500)" }}
            />
          </div>

          {/* Card wrapper with 3-D tilt */}
          <div
            className="relative rounded-2xl border border-neutral-200 bg-neutral-900 shadow-xl overflow-hidden"
            style={{ transform: "perspective(800px) rotateX(4deg) rotateY(-2deg)" }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 bg-neutral-800/60">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-auto text-xs text-neutral-500 font-mono">server.ts</span>
            </div>

            {/* Fake code */}
            <div className="px-5 py-5 font-mono text-sm leading-relaxed" aria-hidden="true">
              <CodeLine color="text-purple-400" indent={0} tokens={[{ t: "import", c: "text-blue-400" }, { t: " { NestFactory } ", c: "text-neutral-300" }, { t: "from", c: "text-blue-400" }, { t: " '@nestjs/core'", c: "text-green-400" }]} />
              <CodeLine color="text-purple-400" indent={0} tokens={[{ t: "import", c: "text-blue-400" }, { t: " { AppModule } ", c: "text-neutral-300" }, { t: "from", c: "text-blue-400" }, { t: " './app.module'", c: "text-green-400" }]} />
              <div className="h-3" />
              <CodeLine indent={0} tokens={[{ t: "async function ", c: "text-purple-400" }, { t: "bootstrap", c: "text-yellow-400" }, { t: "() {", c: "text-neutral-300" }]} />
              <CodeLine indent={1} tokens={[{ t: "const ", c: "text-blue-400" }, { t: "app ", c: "text-neutral-200" }, { t: "= await ", c: "text-neutral-400" }, { t: "NestFactory", c: "text-yellow-300" }, { t: ".create(", c: "text-neutral-300" }, { t: "AppModule", c: "text-teal-400" }, { t: ");", c: "text-neutral-300" }]} />
              <CodeLine indent={1} tokens={[{ t: "await ", c: "text-blue-400" }, { t: "app", c: "text-neutral-200" }, { t: ".listen(", c: "text-neutral-300" }, { t: "3000", c: "text-orange-400" }, { t: ");", c: "text-neutral-300" }]} />
              <CodeLine indent={0} tokens={[{ t: "}", c: "text-neutral-300" }]} />
              <div className="h-3" />
              <CodeLine indent={0} tokens={[{ t: "bootstrap", c: "text-yellow-400" }, { t: "();  ", c: "text-neutral-300" }, { t: "// ✦ production-ready", c: "text-neutral-500 italic" }]} />
            </div>

            {/* Subtle gradient bottom glow */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-primary-900/20 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Stats strip */}
        <div ref={statsRef} className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <StatItem
            label="10k+ Devs"
            icon={
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm4.5 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM0 16a8 8 0 1 1 16 0H0Zm8 0a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6Z" />
              </svg>
            }
          />
          <div className="hidden sm:block h-4 w-px bg-neutral-200" aria-hidden="true" />
          <StatItem
            label="99.9% Uptime"
            icon={
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm11.78-1.72a.75.75 0 0 0-1.06-1.06L7 8.94 5.28 7.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l4.25-4.25Z" clipRule="evenodd" />
              </svg>
            }
          />
          <div className="hidden sm:block h-4 w-px bg-neutral-200" aria-hidden="true" />
          <StatItem
            label="< 5min Setup"
            icon={
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7-7a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 1Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm1.5-4.58a2.5 2.5 0 1 1-3 0V4.5a1.5 1.5 0 1 1 3 0v.92Z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
}

// ─── Internal helpers ─────────────────────────────────────────

interface Token {
  t: string;
  c: string;
}

function CodeLine({
  tokens,
  indent = 0,
  color,
}: {
  tokens: Token[];
  indent?: number;
  color?: string;
}) {
  return (
    <div className={clsx("flex", color)}>
      <span className="select-none text-neutral-700 mr-4 text-right w-4 shrink-0">
        {/* line gutter — intentionally empty */}
      </span>
      {indent > 0 && (
        <span style={{ width: `${indent * 1.5}rem` }} className="shrink-0" />
      )}
      {tokens.map((tok, i) => (
        <span key={i} className={tok.c}>{tok.t}</span>
      ))}
    </div>
  );
}
