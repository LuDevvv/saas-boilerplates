# NodeStack Design System

## Design Philosophy

NodeStack's visual language prioritises clarity and trust: every element earns its place by reducing cognitive load or building confidence in the product. Motion is purposeful — it communicates state changes and hierarchy, never decorates for its own sake. The system is built from a single source of truth (CSS custom properties) so token updates propagate to Tailwind, inline styles, and `@motionone/dom` animations without drift.

---

## Color Tokens

All tokens live in `apps/web/app/globals.css` as CSS custom properties and are consumed by `tailwind.config.js` via `var(--token-name)`.

### Primary (Indigo)

| Token | CSS Variable | Hex |
|---|---|---|
| primary-50 | `--color-primary-50` | `#f0f4ff` |
| primary-100 | `--color-primary-100` | `#e0e9ff` |
| primary-200 | `--color-primary-200` | `#c7d7fe` |
| primary-300 | `--color-primary-300` | `#a5b8fd` |
| primary-400 | `--color-primary-400` | `#8192f8` |
| primary-500 | `--color-primary-500` | `#6366f1` — default CTA |
| primary-600 | `--color-primary-600` | `#4f46e5` — hover state |
| primary-700 | `--color-primary-700` | `#4338ca` |
| primary-800 | `--color-primary-800` | `#3730a3` |
| primary-900 | `--color-primary-900` | `#312e81` |

### Neutral (Slate)

| Token | Hex | Usage |
|---|---|---|
| neutral-0 | `#ffffff` | Page background, card fill |
| neutral-50 | `#f8fafc` | Alternate section backgrounds |
| neutral-100 | `#f1f5f9` | Input backgrounds, hover surfaces |
| neutral-200 | `#e2e8f0` | Borders, dividers |
| neutral-300 | `#cbd5e1` | Placeholder text, disabled |
| neutral-400 | `#94a3b8` | Secondary icons |
| neutral-500 | `#64748b` | Body secondary text |
| neutral-600 | `#475569` | Body primary text |
| neutral-700 | `#334155` | Headings (light mode secondary) |
| neutral-800 | `#1e293b` | Headings (light mode primary) |
| neutral-900 | `#0f172a` | Dark background, logo |

### Semantic

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| Success | `--color-success` | `#22c55e` | Completed states, checkmarks |
| Warning | `--color-warning` | `#f59e0b` | Caution badges |
| Error | `--color-error` | `#ef4444` | Form errors, destructive actions |
| Info | `--color-info` | `#3b82f6` | Informational toasts |

### Surface Aliases

| Alias | Resolves to | Semantic meaning |
|---|---|---|
| `--surface-bg` | neutral-0 | Page canvas |
| `--surface-muted` | neutral-50 | Alternating section background |
| `--surface-card` | neutral-0 | Card background |
| `--surface-border` | neutral-200 | Card / input border |

---

## Typography Scale

The `font-sans` family is Inter (loaded via `next/font/google`). `font-display` resolves to the same variable for headings — swap it independently for a distinct display face if needed.

| Step | Size | rem | Line height | Usage |
|---|---|---|---|---|
| xs | 12px | 0.75rem | 1.5 | Captions, badges, legal |
| sm | 14px | 0.875rem | 1.5 | Nav links, secondary body, table cells |
| base | 16px | 1rem | 1.625 | Body copy, input text |
| lg | 18px | 1.125rem | 1.556 | Lead paragraphs |
| xl | 20px | 1.25rem | 1.4 | Card titles |
| 2xl | 24px | 1.5rem | 1.333 | Section sub-headings |
| 3xl | 30px | 1.875rem | 1.267 | Section headings (mobile) |
| 4xl | 36px | 2.25rem | 1.222 | Section headings (desktop) |
| 5xl | 48px | 3rem | 1.1 | Hero sub-heading |
| 6xl | 60px | 3.75rem | 1.05 | Hero heading (mobile) |
| 7xl | 72px | 4.5rem | 1 | Hero heading (desktop) |

Font weight conventions: `400` body, `500` emphasis, `600` nav/labels, `700` sub-headings, `800` display/hero.

---

## Spacing Scale

NodeStack uses Tailwind's default 4px base-unit scale (`1 unit = 0.25rem = 4px`). Key landmarks:

| Value | px | Rem | Usage |
|---|---|---|---|
| 1 | 4px | 0.25rem | Fine-grained gaps |
| 2 | 8px | 0.5rem | Icon padding, compact row gaps |
| 3 | 12px | 0.75rem | Button padding-y |
| 4 | 16px | 1rem | Button padding-x, card padding-sm |
| 6 | 24px | 1.5rem | Card padding, section element gap |
| 8 | 32px | 2rem | Heading–body gap |
| 10 | 40px | 2.5rem | CTA row gap |
| 12 | 48px | 3rem | Mobile section padding-y |
| 16 | 64px | 4rem | Section padding-y (small) |
| 20 | 80px | 5rem | Section padding-y (medium) |
| 24 | 96px | 6rem | Section padding-y (large) |
| 28 | 112px | 7rem | Section padding-y (max) |

Section vertical rhythm uses fluid clamping:

```css
--section-padding-y: clamp(4rem, 8vw, 7rem); /* ~64px → 112px */
```

---

## Shadow & Radius Tokens

### Shadows

| Token | CSS Variable | Value |
|---|---|---|
| sm | `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| md | `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)` |
| lg | `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)` |
| xl | `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)` |
| glow | `--shadow-glow` | `0 0 40px rgb(99 102 241 / 0.15)` — primary button accent |

### Border Radius

| Token | CSS Variable | Value | Usage |
|---|---|---|---|
| sm | `--radius-sm` | `0.375rem` (6px) | Input fields, small chips |
| md | `--radius-md` | `0.5rem` (8px) | Dropdown rows, menu items |
| lg | `--radius-lg` | `0.75rem` (12px) | Navbar CTA, tag pills |
| xl | `--radius-xl` | `1rem` (16px) | Cards, modals |
| 2xl | `--radius-2xl` | `1.5rem` (24px) | Hero card, showcase frames |
| full | `--radius-full` | `9999px` | Avatar rings, toggle tracks |

---

## Animation Principles

### Core Model

All motion follows three rules:

1. **Purposeful** — only animate to communicate state change, sequence, or depth.
2. **Fast on exit, unhurried on entrance** — exits are 150 ms; entrances peak at 400 ms.
3. **Ease-out-expo everywhere** — `cubic-bezier(0.16, 1, 0.3, 1)` feels physical and snappy without overshooting.

### Entrance Animation

Elements enter with a vertical fade-up:

```
translateY(24px) → translateY(0)
opacity(0)       → opacity(1)
duration: 400ms
easing: cubic-bezier(0.16, 1, 0.3, 1)   /* --ease-out */
```

### Stagger

When multiple sibling elements enter together (feature cards, pricing tiers, FAQ items), each child delays its entrance by 80 ms relative to the previous:

```
child[0]: delay 0ms
child[1]: delay 80ms
child[2]: delay 160ms
...
```

### Hover Interactions

| Interaction | Transform | Duration | Easing |
|---|---|---|---|
| Button press | `scale(1.02)` on hover, `scale(0.98)` on active | 150ms | ease |
| Card lift | `translateY(-2px)` + shadow upgrade | 200ms | ease |
| Nav underline | width `0 → 100%` | 300ms | `--ease-out` |
| Logo marquee | `translateX(0 → -50%)` | 35s | `linear` — infinite |

### Keyframe Inventory

| Name | Used in | Description |
|---|---|---|
| `word-in` | Hero heading | Per-word staggered lift from y=20px |
| `marquee` | LogoMarquee | Continuous horizontal scroll |
| `float-blob` | Hero background | Slow organic drift, 12–14s |
| `pulse-ring` | CTAs, status dots | 2.5s pulsing glow ring |
| `draw-path` | SVG connectors | Stroke-dashoffset draw-on |

---

## Motion One API

The project uses `@motionone/dom` (already in `package.json`) for imperative animations triggered by scroll or events. React's `useEffect` is the entry point.

### `animate(element, keyframes, options)`

Animate a single DOM element or a CSS selector string.

```typescript
import { animate } from "@motionone/dom";

animate(
  headerRef.current,
  { boxShadow: ["0 0 0 0 transparent", "0 1px 0 0 rgba(226,232,240,0.5)"] },
  { duration: 0.25, easing: [0.16, 1, 0.3, 1] }
);
```

- `keyframes` accepts any animatable CSS property as arrays `[from, to]` or objects.
- `options.easing` accepts a cubic-bezier array `[x1, y1, x2, y2]` or a named string.
- Returns an `AnimationControls` handle with `.stop()`, `.pause()`, `.play()`, `.finished`.

### `inView(element, callback, options)`

Fires `callback` once when `element` enters the viewport. Returns a cleanup function.

```typescript
import { inView } from "@motionone/dom";

useEffect(() => {
  const stop = inView(cardRef.current!, (entry) => {
    animate(entry.target, { opacity: [0, 1], y: [24, 0] }, { duration: 0.4 });
  }, { amount: 0.2 }); // trigger when 20% visible

  return stop;
}, []);
```

- `options.amount` — fraction of element that must be visible (`0–1`).
- `options.margin` — root margin string (`"0px 0px -100px 0px"`).
- Callback receives the `IntersectionObserverEntry`; the element is `entry.target`.

### `stagger(duration, options)`

Generates per-element delay values for array-target animations.

```typescript
import { animate, stagger } from "@motionone/dom";

animate(
  ".feature-card",
  { opacity: [0, 1], y: [24, 0] },
  { duration: 0.4, delay: stagger(0.08), easing: [0.16, 1, 0.3, 1] }
);
```

- First arg is the stagger interval in **seconds**.
- `options.start` — delay before the first element (default `0`).
- `options.from` — `"first"` | `"last"` | `"center"` | index.

### `useGsapReveal` Hook (custom)

Wraps `inView` + `animate` into a reusable hook for section-level entrances.

```typescript
// apps/web/lib/hooks/useGsapReveal.ts
import { useEffect, useRef } from "react";
import { animate, inView, stagger } from "@motionone/dom";

interface RevealOptions {
  selector?: string;   // child selector; omit to animate the root ref
  duration?: number;   // seconds, default 0.4
  staggerMs?: number;  // ms between children, default 80
  amount?: number;     // inView threshold, default 0.15
  y?: number;          // lift distance px, default 24
}

export function useGsapReveal<T extends HTMLElement>(opts: RevealOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;

    const {
      selector,
      duration = 0.4,
      staggerMs = 80,
      amount = 0.15,
      y = 24,
    } = opts;

    const target = selector
      ? ref.current.querySelectorAll(selector)
      : ref.current;

    const stop = inView(
      ref.current,
      () => {
        animate(
          target as Element | NodeListOf<Element>,
          { opacity: [0, 1], y: [y, 0] },
          {
            duration,
            delay: selector ? stagger(staggerMs / 1000) : 0,
            easing: [0.16, 1, 0.3, 1],
          }
        );
      },
      { amount }
    );

    return stop;
  }, []);

  return ref;
}
```

Usage:

```typescript
const ref = useGsapReveal<HTMLElement>({ selector: ".card", staggerMs: 80 });
return <section ref={ref}>...</section>;
```

### `useMotionAnimate` Hook (custom)

Wraps `animate` into a hook that returns a trigger function — useful for hover/click-driven animations inside React event handlers.

```typescript
// apps/web/lib/hooks/useMotionAnimate.ts
import { useCallback, useRef } from "react";
import { animate, AnimationOptions } from "@motionone/dom";

export function useMotionAnimate<T extends HTMLElement>(
  keyframes: Record<string, string[]>,
  options: AnimationOptions = {}
) {
  const ref = useRef<T>(null);

  const trigger = useCallback(() => {
    if (ref.current) {
      animate(ref.current, keyframes, options);
    }
  }, [keyframes, options]);

  return { ref, trigger };
}
```

Usage:

```typescript
const { ref, trigger } = useMotionAnimate<HTMLDivElement>(
  { scale: ["1", "1.02"], boxShadow: ["var(--shadow-md)", "var(--shadow-xl)"] },
  { duration: 0.15 }
);
return <div ref={ref} onMouseEnter={trigger}>...</div>;
```

---

## Grid System

| Property | Value |
|---|---|
| Columns | 12 |
| Max width | 1200px (`--container-max`) |
| Horizontal padding | `clamp(1rem, 5vw, 2rem)` (`--container-padding`) |
| Gutter | Tailwind `gap-6` (24px) between cards; `gap-8` (32px) between major columns |

The `.container` utility class (defined in `globals.css`) applies the max-width and fluid padding. Always use it as the outermost wrapper inside a section, not as the section element itself.

Section wrapper pattern:

```html
<section class="section bg-neutral-50">
  <div class="container">
    <!-- content -->
  </div>
</section>
```

---

## Component Patterns

### Card

A card is a white rounded surface with a border and shadow. Hover lifts it slightly.

```html
<div class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm
            transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
  <!-- content -->
</div>
```

Gradient-border variant (featured/highlighted state):

```html
<div class="gradient-border-card rounded-xl p-6 shadow-sm">
  <!-- content -->
</div>
```

### Badge

Small pill label used for feature tags, status indicators, and category labels.

```html
<!-- Default -->
<span class="inline-flex items-center gap-1.5 rounded-full bg-primary-50
             px-3 py-1 text-xs font-semibold text-primary-700">
  Label
</span>

<!-- Neutral -->
<span class="inline-flex items-center gap-1.5 rounded-full bg-neutral-100
             px-3 py-1 text-xs font-semibold text-neutral-600">
  Label
</span>
```

### Button

Three variants share the same sizing and focus ring conventions.

**Primary** (filled):
```html
<button class="inline-flex items-center justify-center gap-2 rounded-xl
               bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white
               shadow-glow transition-all duration-150
               hover:bg-primary-600 hover:scale-[1.02]
               active:scale-[0.98]
               focus-visible:outline focus-visible:outline-2
               focus-visible:outline-primary-500 focus-visible:outline-offset-2">
  Get Started
</button>
```

**Ghost** (text only):
```html
<button class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
               text-neutral-600 transition-colors hover:text-neutral-900
               focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md">
  Learn more
</button>
```

**Outline**:
```html
<button class="inline-flex items-center gap-2 rounded-xl border border-neutral-200
               px-5 py-2.5 text-sm font-semibold text-neutral-700 bg-white
               transition-all duration-150 hover:border-primary-300
               hover:text-primary-600 hover:bg-primary-50
               focus-visible:ring-2 focus-visible:ring-primary-500">
  View Docs
</button>
```

### Section Layout

Every above-fold section follows this structure:

```tsx
<section id="section-id" className="section bg-white">
  <div className="container">
    {/* Section header */}
    <div className="mx-auto max-w-2xl text-center mb-12 lg:mb-16">
      <span className="badge-primary">Category label</span>
      <h2 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl">
        Section Headline
      </h2>
      <p className="mt-4 text-lg text-neutral-500">
        Supporting copy — one or two sentences.
      </p>
    </div>

    {/* Content grid */}
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* Cards, items, etc. */}
    </div>
  </div>
</section>
```

Alternate sections use `bg-neutral-50` to create a subtle rhythm.

---

## Section Inventory

| Component | File | Purpose |
|---|---|---|
| `Navbar` | `components/sections/Navbar.tsx` | Sticky navigation with scroll-aware glass effect and mobile drawer |
| `HeroSection` | `components/sections/HeroSection.tsx` | First impression: headline, sub-copy, dual CTAs, hero visual |
| `LogoMarquee` | `components/sections/LogoMarquee.tsx` | Social proof via infinite-scroll logo strip |
| `FeaturesSection` | `components/sections/FeaturesSection.tsx` | 3-up or 6-up feature card grid with icon, title, description |
| `StatsSection` | `components/sections/StatsSection.tsx` | Animated counters: developer count, uptime, setup time |
| `FeatureShowcase` | `components/sections/FeatureShowcase.tsx` | Alternating text + visual deep-dive on two or three key features |
| `HowItWorksSection` | `components/sections/HowItWorksSection.tsx` | Numbered step list (clone → configure → deploy) |
| `TestimonialsSection` | `components/sections/TestimonialsSection.tsx` | Quote cards with avatar, name, role |
| `PricingSection` | `components/sections/PricingSection.tsx` | Monthly/annual toggle with tier cards and feature lists |
| `FAQSection` | `components/sections/FAQSection.tsx` | Accordion-style Q&A |
| `CTASection` | `components/sections/CTASection.tsx` | Full-width bottom CTA with gradient background |
| `Footer` | `components/sections/Footer.tsx` | Links, legal, copyright |

### Load strategy

- `Navbar`, `HeroSection`, `LogoMarquee`, `FeaturesSection`, `StatsSection`, `PricingSection`, `FAQSection`, `CTASection`, `Footer` — static imports (above fold or always needed).
- `FeatureShowcase`, `HowItWorksSection`, `TestimonialsSection` — `next/dynamic` with `ssr: true` and a height-matched skeleton fallback (see `app/(app)/page.tsx`).
