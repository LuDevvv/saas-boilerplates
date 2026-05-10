"use client";

import { CheckCircle2, type LucideIcon } from "lucide-react";
import { useGsapReveal } from "@node-stack/ui";
import clsx from "clsx";

// ─── Types ────────────────────────────────────────────────────

interface Bullet {
  text: string;
}

interface ShowcaseRow {
  badge: string;
  badgeColor: string;
  heading: string;
  bullets: Bullet[];
  learnMoreHref: string;
  visual: React.ReactNode;
  visualLeft?: boolean;
}

// ─── Text side ────────────────────────────────────────────────

function TextSide({
  row,
  direction,
}: {
  row: ShowcaseRow;
  direction: "left" | "right";
}) {
  const ref = useGsapReveal<HTMLDivElement>({ direction, delay: 0.1, duration: 0.7 });

  return (
    <div ref={ref} className="flex flex-col justify-center gap-6">
      <span
        className={clsx(
          "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold",
          row.badgeColor
        )}
      >
        {row.badge}
      </span>

      <h3 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl leading-tight">
        {row.heading}
      </h3>

      <ul className="flex flex-col gap-3">
        {row.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-primary-500"
              aria-hidden="true"
            />
            <span className="text-sm text-neutral-600 leading-relaxed">{b.text}</span>
          </li>
        ))}
      </ul>

      <a
        href={row.learnMoreHref}
        className="animated-underline inline-flex w-fit items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
      >
        Learn more
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}

// ─── Visual side wrapper ──────────────────────────────────────

function VisualSide({
  children,
  direction,
}: {
  children: React.ReactNode;
  direction: "left" | "right";
}) {
  const ref = useGsapReveal<HTMLDivElement>({ direction, delay: 0.2, duration: 0.7 });
  return (
    <div ref={ref} className="flex items-center justify-center">
      {children}
    </div>
  );
}

// ─── Mockup: Session list ─────────────────────────────────────

function SessionMockup() {
  const sessions = [
    { device: "MacBook Pro", location: "San Francisco, CA", browser: "Chrome", active: true },
    { device: "iPhone 16 Pro", location: "New York, NY",    browser: "Safari", active: false },
    { device: "Windows PC",   location: "London, UK",       browser: "Firefox",active: false },
  ];

  return (
    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-neutral-900 shadow-xl overflow-hidden">
      {/* Chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 bg-neutral-800/60">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs font-medium text-neutral-400 font-mono">Active Sessions</span>
      </div>

      <div className="divide-y divide-white/10">
        {sessions.map((s, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              {/* Device icon */}
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <DeviceIcon device={s.device} />
              </span>
              <div>
                <p className="text-xs font-semibold text-neutral-200">{s.device}</p>
                <p className="text-[11px] text-neutral-500">{s.browser} · {s.location}</p>
              </div>
            </div>
            {s.active ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-1 text-[11px] font-semibold text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                Current
              </span>
            ) : (
              <button className="rounded-lg border border-red-500/30 px-2.5 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-500/10 transition-colors">
                Revoke
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-3 bg-white/5">
        <p className="text-[11px] text-neutral-500 text-center">Sessions are cryptographically signed · rotate on suspicious activity</p>
      </div>
    </div>
  );
}

function DeviceIcon({ device }: { device: string }) {
  if (device.startsWith("iPhone")) {
    return (
      <svg className="h-4 w-4 text-neutral-400" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6ZM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5ZM8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 text-neutral-400" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm15 7V4a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v7h14Zm-5 2v1h2a.5.5 0 0 1 0 1H4a.5.5 0 0 1 0-1h2v-1h4Z"/>
    </svg>
  );
}

// ─── Mockup: Workspace switcher ───────────────────────────────

function WorkspaceMockup() {
  const workspaces = [
    { name: "Acme Corp",    plan: "Pro",         avatar: "AC", color: "bg-violet-500" },
    { name: "StartupXYZ",  plan: "Starter",      avatar: "SX", color: "bg-teal-500"  },
    { name: "Dev Sandbox",  plan: "Free",         avatar: "DS", color: "bg-orange-500"},
  ];

  return (
    <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Switch workspace</p>
      </div>

      <div className="divide-y divide-neutral-100">
        {workspaces.map((ws, i) => (
          <div
            key={i}
            className={clsx(
              "flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50 transition-colors cursor-pointer",
              i === 0 && "bg-primary-50/60"
            )}
          >
            <div className="flex items-center gap-3">
              <span className={clsx("flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold", ws.color)}>
                {ws.avatar}
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-800">{ws.name}</p>
                <p className="text-[11px] text-neutral-400">workspace</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={clsx(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                ws.plan === "Pro"     && "bg-violet-100 text-violet-700",
                ws.plan === "Starter" && "bg-teal-100 text-teal-700",
                ws.plan === "Free"    && "bg-neutral-100 text-neutral-500"
              )}>
                {ws.plan}
              </span>
              {i === 0 && (
                <svg className="h-4 w-4 text-primary-500" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New workspace CTA */}
      <div className="border-t border-neutral-100 px-4 py-3">
        <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-neutral-300 text-neutral-400 text-base leading-none">+</span>
          Create new workspace
        </button>
      </div>
    </div>
  );
}

// ─── Mockup: Terminal code snippet ───────────────────────────

function TerminalMockup() {
  return (
    <div className="w-full max-w-lg rounded-2xl border border-neutral-700 bg-neutral-950 shadow-xl overflow-hidden font-mono text-sm">
      {/* Chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 bg-neutral-900">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-[11px] text-neutral-500">sdk-usage.ts</span>
      </div>

      {/* Code */}
      <div className="px-5 py-5 leading-relaxed">
        <p>
          <span className="text-blue-400">import</span>
          <span className="text-neutral-300"> {`{ NodeStackClient }`} </span>
          <span className="text-blue-400">from</span>
          <span className="text-green-400"> '@node-stack/sdk'</span>
          <span className="text-neutral-300">;</span>
        </p>
        <div className="h-3" />
        <p>
          <span className="text-blue-400">const</span>
          <span className="text-sky-300"> client</span>
          <span className="text-neutral-400"> = </span>
          <span className="text-yellow-300">new NodeStackClient</span>
          <span className="text-neutral-300">{"({"}</span>
        </p>
        <p>
          <span className="text-neutral-300">{"  "}</span>
          <span className="text-teal-300">apiKey</span>
          <span className="text-neutral-400">: </span>
          <span className="text-green-400">process.env</span>
          <span className="text-neutral-300">.NS_API_KEY,</span>
        </p>
        <p>
          <span className="text-neutral-300">{"  "}</span>
          <span className="text-teal-300">workspaceId</span>
          <span className="text-neutral-400">: </span>
          <span className="text-green-400">'ws_01h...'</span>
          <span className="text-neutral-300">,</span>
        </p>
        <p><span className="text-neutral-300">{"}"});"</span></p>
        <div className="h-3" />
        <p>
          <span className="text-neutral-500">{"// Fully typed response "}</span>
          <span className="text-green-500">✓</span>
        </p>
        <p>
          <span className="text-blue-400">const</span>
          <span className="text-sky-300"> task</span>
          <span className="text-neutral-400"> = await </span>
          <span className="text-sky-300">client</span>
          <span className="text-neutral-300">.</span>
          <span className="text-yellow-300">tasks</span>
          <span className="text-neutral-300">.</span>
          <span className="text-yellow-300">create</span>
          <span className="text-neutral-300">{"({"}</span>
        </p>
        <p>
          <span className="text-neutral-300">{"  "}</span>
          <span className="text-teal-300">title</span>
          <span className="text-neutral-400">: </span>
          <span className="text-green-400">'Ship the MVP'</span>
          <span className="text-neutral-300">,</span>
        </p>
        <p>
          <span className="text-neutral-300">{"  "}</span>
          <span className="text-teal-300">priority</span>
          <span className="text-neutral-400">: </span>
          <span className="text-orange-400">'high'</span>
          <span className="text-neutral-300">,</span>
        </p>
        <p><span className="text-neutral-300">{"});"}</span></p>
        <div className="h-3" />
        <p className="text-neutral-500">
          <span className="text-neutral-600">$</span>
          <span className="text-green-400 ml-2">task.id</span>
          <span className="text-neutral-400">{" // "}</span>
          <span className="text-neutral-300">"tsk_01j..."</span>
        </p>
      </div>
    </div>
  );
}

// ─── Row data ─────────────────────────────────────────────────

const ROWS: ShowcaseRow[] = [
  {
    badge: "Authentication & Sessions",
    badgeColor: "bg-violet-100 text-violet-700",
    heading: "Secure by default, flexible by design",
    bullets: [
      { text: "JWT access tokens + rotating refresh tokens with cryptographic signing" },
      { text: "TOTP-based 2FA with authenticator app support and recovery codes" },
      { text: "Multi-device session management with instant revocation" },
      { text: "Argon2id password hashing with configurable cost factors" },
    ],
    learnMoreHref: "#features",
    visual: <SessionMockup />,
    visualLeft: false,
  },
  {
    badge: "Multi-tenant RLS",
    badgeColor: "bg-teal-100 text-teal-700",
    heading: "Zero-config data isolation at the database layer",
    bullets: [
      { text: "Postgres Row-Level Security enforced for every query — no bypass possible from app code" },
      { text: "Workspace-scoped transactions via withTenantTx — set once, enforced everywhere" },
      { text: "Cross-tenant admin operations through audited withSystemTx" },
      { text: "RLS fail-closed: fresh DB returns 0 rows rather than leaking data" },
    ],
    learnMoreHref: "#features",
    visual: <WorkspaceMockup />,
    visualLeft: true,
  },
  {
    badge: "Developer Experience",
    badgeColor: "bg-orange-100 text-orange-700",
    heading: "Type-safe from database schema to client SDK",
    bullets: [
      { text: "Drizzle ORM schemas infer TypeScript types — no ORMconfig drift" },
      { text: "Auto-generated SDK stays in sync with the API, caught at compile time" },
      { text: "pnpm workspaces monorepo with shared packages and strict tsconfig" },
      { text: "One-command local dev with docker-compose, migrations, and seeding" },
    ],
    learnMoreHref: "#features",
    visual: <TerminalMockup />,
    visualLeft: false,
  },
];

// ─── Section ──────────────────────────────────────────────────

function ShowcaseHeading() {
  const ref = useGsapReveal<HTMLDivElement>({ direction: "up", delay: 0, duration: 0.7 });
  return (
    <div ref={ref} className="mb-20 text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-600">
        How it works
      </p>
      <h2
        id="showcase-heading"
        className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
      >
        See what's under the hood
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base text-neutral-500">
        Every layer of NodeStack is designed for the real constraints of shipping production software — security, scale, and developer sanity.
      </p>
    </div>
  );
}

export function FeatureShowcase() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="showcase-heading"
      className="section bg-white"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ShowcaseHeading />

        <div className="flex flex-col gap-24">
          {ROWS.map((row, i) => {
            const textDir: "left" | "right" = row.visualLeft ? "right" : "left";
            const visualDir: "left" | "right" = row.visualLeft ? "left" : "right";

            return (
              <div
                key={i}
                className={clsx(
                  "grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center",
                )}
              >
                {/* Text side */}
                <div className={clsx(row.visualLeft && "lg:order-2")}>
                  <TextSide row={row} direction={textDir} />
                </div>

                {/* Visual side */}
                <div className={clsx(row.visualLeft && "lg:order-1")}>
                  <VisualSide direction={visualDir}>
                    {row.visual}
                  </VisualSide>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
