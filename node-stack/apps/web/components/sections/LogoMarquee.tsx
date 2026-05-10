// Server component — no 'use client'

interface LogoDef {
  name: string;
  svg: React.ReactNode;
}

function GithubLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

const LOGOS: LogoDef[] = [
  {
    name: "GitHub",
    svg: (
      <span className="flex items-center gap-1.5">
        <GithubLogo />
        <span className="font-semibold text-sm">GitHub</span>
      </span>
    ),
  },
  {
    name: "Stripe",
    svg: (
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
        </svg>
        <span className="font-semibold text-sm">Stripe</span>
      </span>
    ),
  },
  {
    name: "Vercel",
    svg: (
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
          <path d="M24 22.525H0l12-21.05 12 21.05z" />
        </svg>
        <span className="font-semibold text-sm">Vercel</span>
      </span>
    ),
  },
  {
    name: "Supabase",
    svg: (
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
          <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.111 12.876.706 14.087 1.75 14.087h8.948l.005 8.878c.015.986 1.26 1.409 1.875.636l9.262-11.653c.652-.826.057-2.036-.987-2.036h-8.948L11.9 1.036z" />
        </svg>
        <span className="font-semibold text-sm">Supabase</span>
      </span>
    ),
  },
  {
    name: "PlanetScale",
    svg: (
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.016 6.496L8.459 18.868a8.29 8.29 0 0 1-1.455-1.455L15.561 5.041a8.29 8.29 0 0 1 1.455 1.455zm1.407 2.029A8.315 8.315 0 0 1 20.31 12a8.315 8.315 0 0 1-1.887 5.264L8.736 5.577A8.315 8.315 0 0 1 12 3.69a8.315 8.315 0 0 1 6.423 4.835z" />
        </svg>
        <span className="font-semibold text-sm">PlanetScale</span>
      </span>
    ),
  },
  {
    name: "Linear",
    svg: (
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
          <path d="M0 14.723a11.97 11.97 0 0 0 9.277 9.277L0 14.723zM0 10.054l13.946 13.946A11.971 11.971 0 0 0 17.123 22.8L1.2 6.877A11.971 11.971 0 0 0 0 10.054zM2.384 4.23L19.77 21.616A12.002 12.002 0 0 0 21.617 19.77L4.23 2.383A12.002 12.002 0 0 0 2.384 4.23zM6.877 1.2L22.8 17.123A11.97 11.97 0 0 0 24 13.946L13.946 0A11.97 11.97 0 0 0 6.877 1.2zM14.723 0l9.277 9.277A11.97 11.97 0 0 0 14.723 0z" />
        </svg>
        <span className="font-semibold text-sm">Linear</span>
      </span>
    ),
  },
  {
    name: "Notion",
    svg: (
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
          <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
        </svg>
        <span className="font-semibold text-sm">Notion</span>
      </span>
    ),
  },
  {
    name: "Slack",
    svg: (
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
        </svg>
        <span className="font-semibold text-sm">Slack</span>
      </span>
    ),
  },
  {
    name: "Resend",
    svg: (
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
          <path d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6zm9 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-4 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
        </svg>
        <span className="font-semibold text-sm">Resend</span>
      </span>
    ),
  },
  {
    name: "Cloudflare",
    svg: (
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
          <path d="M16.572 10.28l-.244-.02a.38.38 0 0 0-.373.26l-.324.957c-.306.904-.058 1.848.605 2.406l-5.3-.013c.424-.525.618-1.25.425-1.993l-.047-.182a2.16 2.16 0 0 0-2.07-1.62 2.16 2.16 0 0 0-2.14 1.86l-.011.1c-.073.665.154 1.293.57 1.76l-2.82-.007c.15-.286.237-.61.237-.953 0-1.127-.914-2.04-2.04-2.04-1.126 0-2.04.913-2.04 2.04 0 .34.085.66.232.943H0v.88h24v-.88h-5.66c.62-.487.922-1.318.713-2.165l-.047-.182a2.16 2.16 0 0 0-2.434-1.552z" />
        </svg>
        <span className="font-semibold text-sm">Cloudflare</span>
      </span>
    ),
  },
];

// Duplicate for seamless loop
const ROW_1 = [...LOGOS, ...LOGOS];
const ROW_2 = [...LOGOS.slice(5), ...LOGOS.slice(0, 5), ...LOGOS.slice(5), ...LOGOS.slice(0, 5)];

function LogoItem({ logo }: { logo: LogoDef }) {
  return (
    <div
      title={logo.name}
      className="flex items-center text-neutral-600 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default select-none"
    >
      {logo.svg}
    </div>
  );
}

export function LogoMarquee() {
  return (
    <section
      aria-label="Trusted by teams at these companies"
      className="py-14 overflow-hidden border-y border-neutral-100 bg-neutral-50/60"
    >
      {/* Eyebrow */}
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">
        Trusted by teams building with
      </p>

      {/* Marquee wrapper — fade edges */}
      <div
        className="overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        {/* Row 1 — left */}
        <div className="flex overflow-hidden mb-5">
          <div className="flex w-max animate-marquee gap-12 md:gap-16">
            {ROW_1.map((logo, i) => (
              <LogoItem key={`r1-${logo.name}-${i}`} logo={logo} />
            ))}
          </div>
        </div>

        {/* Row 2 — right (reverse) */}
        <div className="flex overflow-hidden">
          <div className="flex w-max animate-marquee-reverse gap-12 md:gap-16">
            {ROW_2.map((logo, i) => (
              <LogoItem key={`r2-${logo.name}-${i}`} logo={logo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
