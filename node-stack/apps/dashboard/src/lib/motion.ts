/**
 * Motion System — Unified Animation Tokens
 * 
 * Based on the "Premium" Motion Personality archetype:
 * - Elegant, minimal, luxury, sophisticated
 * - Signature easing: cubic-bezier(0.4, 0, 0.2, 1) — Material Design 3 standard
 * - All animations use hardware-accelerated properties (transform, opacity)
 * - WAAPI-backed via Motion (motion.dev)
 * 
 * @see motion-design skill — Motion Personality table (Premium row)
 */

// ─── Easing Curves ──────────────────────────────────────────────────────────────
// Directional rules (from motion-design):
//   Entrance → decelerate (ease-out)
//   Exit     → accelerate (ease-in)
//   On-screen → ease-in-out

export const easing = {
  /** Signature curve — used for 80% of animations (Material Design 3) */
  signature: [0.4, 0, 0.2, 1] as const,

  /** Entrance animations — fast start, gentle landing (MD3 Emphasized) */
  entrance: [0.05, 0.7, 0.1, 1] as const,

  /** Exit animations — gentle start, fast departure (MD3 Accelerate) */
  exit: [0.3, 0, 1, 1] as const,

  /** Snappy UI interactions — decisive, instant-feeling */
  snappy: [0.2, 0, 0, 1] as const,

  /** Gentle ambient — background life, floats */
  gentle: [0.4, 0, 0.2, 1] as const,

  /** Spring-like settle — slight overshoot for playful confirmations */
  settle: [0.175, 0.885, 0.32, 1.275] as const,
} as const;

// ─── Duration Palette ───────────────────────────────────────────────────────────
// Three core durations + element-specific overrides (from motion-design Duration Table)

export const duration = {
  /** Micro-feedback: tooltips, hovers (<100ms) */
  instant: 0.08,

  /** Quick: button press, toggles, icon transitions (120-180ms) */
  quick: 0.15,

  /** Standard: cards enter/exit, panels, nav state changes (200-350ms) */
  standard: 0.3,

  /** Slow: modals, dialogs, focus shifts (300-400ms) */
  slow: 0.4,

  /** Dramatic: page transitions, hero reveals (400-600ms) */
  dramatic: 0.5,

  /** Cinematic: theatrical builds, first-load experiences (600-1200ms) */
  cinematic: 0.8,
} as const;

// ─── Transition Presets ─────────────────────────────────────────────────────────
// Pre-built transition configs for common UI patterns.
// Each follows the motion-design "Enter > Exit" rule:
//   Entrances are 30-50% longer than exits.

export const transition = {
  /** Default transition for most on-screen animations */
  default: {
    duration: duration.standard,
    easing: easing.signature,
  },

  /** Sidebar expand/collapse — smooth, decisive */
  sidebar: {
    duration: 0.35,
    easing: easing.signature,
  },

  /** Dropdown / popover entrance — spring-like, premium */
  dropdown: {
    duration: duration.standard,
    easing: easing.entrance,
  },

  /** Dropdown exit — fast, clean departure */
  dropdownExit: {
    duration: duration.quick,
    easing: easing.exit,
  },

  /** Submenu expand/collapse with height animation */
  submenu: {
    duration: 0.3,
    easing: easing.signature,
  },

  /** Submenu collapse exit */
  submenuExit: {
    duration: 0.2,
    easing: easing.exit,
  },

  /** Card entrance — decelerate in, presence-aware */
  cardEnter: {
    duration: duration.standard,
    easing: easing.entrance,
  },

  /** Card exit — accelerate out */
  cardExit: {
    duration: 0.2,
    easing: easing.exit,
  },

  /** Progress bar — linear for progress indication */
  progress: {
    duration: 10,
    easing: "linear" as const,
  },

  /** Cinematic reveal — 3D spatial entrance for auth/hero pages */
  cinematicReveal: {
    duration: duration.cinematic,
    easing: easing.entrance,
  },

  /** Stagger — micro-cascade for list items */
  stagger: {
    delay: 0.1,
  },
} as const;

// ─── Animation Presets (Keyframe Definitions) ────────────────────────────────────
// Pre-built initial/animate/exit states for AnimatePresence patterns.

export const variants = {
  /** Fade + slide up — standard card/panel entrance */
  fadeSlideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10, scale: 0.98 },
  },

  /** Fade + slide down — dropdown menus */
  fadeSlideDown: {
    initial: { opacity: 0, y: -12, scale: 0.96, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, y: -8, scale: 0.96, filter: "blur(4px)" },
  },

  /** Scale fade — dismissible cards */
  scaleFade: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },

  /** Collapse — height-based expand/collapse */
  collapse: {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
  },

  /** Simple fade — overlays, progress bars */
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  /** Overlay backdrop */
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
} as const;
