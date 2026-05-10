import { animate, inView, stagger } from "@motionone/dom";

// ─── Easing presets ────────────────────────────────────────────
export const ease = {
  outExpo:  [0.16, 1, 0.3, 1]    as [number, number, number, number],
  spring:   [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  standard: [0.4, 0, 0.2, 1]      as [number, number, number, number],
} as const;

// ─── Duration presets (seconds) ────────────────────────────────
export const dur = {
  fast:   0.15,
  base:   0.25,
  slow:   0.4,
  slower: 0.6,
} as const;

// ─── Fade + slide up for a single element or NodeList ──────────
export function fadeUp(
  el: Element | NodeListOf<Element>,
  options?: { delay?: number; duration?: number }
) {
  return animate(
    el as Element,
    { opacity: [0, 1], transform: ["translateY(24px)", "translateY(0px)"] },
    { duration: options?.duration ?? dur.slow, easing: ease.outExpo, delay: options?.delay ?? 0 }
  );
}

// ─── Staggered fade-up for multiple elements ───────────────────
export function staggerFadeUp(
  els: NodeListOf<Element> | Element[],
  options?: { staggerDelay?: number; startDelay?: number }
) {
  return animate(
    Array.from(els) as unknown as Element,
    { opacity: [0, 1], transform: ["translateY(24px)", "translateY(0px)"] },
    {
      duration: dur.slow,
      easing: ease.outExpo,
      delay: stagger(options?.staggerDelay ?? 0.08, { start: options?.startDelay ?? 0 }),
    }
  );
}

// ─── Scale in ──────────────────────────────────────────────────
export function scaleIn(el: Element | NodeListOf<Element>) {
  return animate(
    el as Element,
    { opacity: [0, 1], transform: ["scale(0.92)", "scale(1)"] },
    { duration: dur.slow, easing: ease.outExpo }
  );
}

// ─── Slide in from left / right ────────────────────────────────
export function slideIn(
  el: Element | NodeListOf<Element>,
  direction: "left" | "right" = "left"
) {
  const x = direction === "left" ? "-32px" : "32px";
  return animate(
    el as Element,
    { opacity: [0, 1], transform: [`translateX(${x})`, "translateX(0px)"] },
    { duration: dur.slow, easing: ease.outExpo }
  );
}

// ─── Setup inView reveal on a container ────────────────────────
export function setupReveal(
  container: Element,
  options?: {
    selector?: string;
    direction?: "up" | "left" | "right";
    staggerDelay?: number;
  }
) {
  const selector = options?.selector ?? "[data-reveal]";
  const direction = options?.direction ?? "up";

  const transform: [string, string] =
    direction === "left"
      ? ["translateX(-32px)", "translateX(0px)"]
      : direction === "right"
      ? ["translateX(32px)", "translateX(0px)"]
      : ["translateY(24px)", "translateY(0px)"];

  const els = container.querySelectorAll(selector);
  if (!els.length) return;

  els.forEach((el) => {
    (el as HTMLElement).style.opacity = "0";
  });

  return inView(
    container,
    () => {
      animate(Array.from(els) as unknown as Element, { opacity: [0, 1], transform }, {
        duration: dur.slow,
        easing: ease.outExpo,
        delay: stagger(options?.staggerDelay ?? 0.08),
      });
    },
    { margin: "-80px 0px" }
  );
}
