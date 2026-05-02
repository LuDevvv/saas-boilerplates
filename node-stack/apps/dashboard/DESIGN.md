---
version: beta-1.0
name: Modern Premium SaaS Design System
description: A high-fidelity, secure yet delightful design system. It balances deep trust-blue tones and hyper-rounded bento surfaces with engaging micro-interactions, natural motion, and friendly copy to eradicate sterile corporate UI.
colors:
  primary: "#004080"
  secondary: "#00E6E6"
  accent: "#4D94DB"
  canvas-light: "#F8FAFC"
  canvas-dark: "#0F172A"
  surface-light: "#FFFFFF"
  surface-dark: "#1E293B"
  border-light: "#F1F5F9" # Softer border for a cleaner look
  border-dark: "rgba(255, 255, 255, 0.05)"
  text-primary-light: "#0F172A"
  text-primary-dark: "#F8FAFC"
  text-secondary-light: "#64748B"
  text-secondary-dark: "#94A3B8"
  # New: Functional Status Colors (Inspired by reference images)
  status-success: "#10B981"
  status-warning: "#F59E0B"
  status-error: "#EF4444"
  status-info: "#3B82F6"
typography:
  hero-heading:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: -0.05em
  kpi-value:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -0.025em
  section-title:
    fontFamily: Inter
    fontSize: 16px # Slightly smaller for elegance
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  nav-link:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    letterSpacing: -0.01em
  caption-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 700
    letterSpacing: 0.05em # Reduced tracking for better readability
  badge-label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    letterSpacing: 0em
rounded:
  sm: 6px
  md: 10px
  lg: 14px
  xl: 18px
  "2xl": 24px
  "3xl": 32px
  hero: 40px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  "2xl": 48px
  "3xl": 64px
components:
  card-bento:
    backgroundColor: "{colors.surface-light}"
    rounded: "{rounded.2xl}"
    border: "1px solid {colors.border-light}"
    shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)"
    padding: "20px"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
  input-standard:
    backgroundColor: "{colors.surface-light}" # Cleaner standard inputs
    rounded: "{rounded.lg}"
    padding: "12px 16px"
    border: "1px solid {colors.border-light}"
    shadow: "0 1px 2px 0 rgba(0, 0, 0, 0.02)"
  sidebar-container:
    backgroundColor: "{colors.canvas-light}" # Blends with background
    borderRight: "1px solid {colors.border-light}"
    width: 280px
---

# Design System & UI/UX Guidelines

## 1. Overview & Philosophy

The UI breaks away from sterile "corporate mush" by embracing a **Delightful Premium** philosophy. It balances high-density data logic with a playful, highly interactive, and clear user experience.

- **Context, Not Clutter**: Elements on the screen (illustrations, badges, charts) must provide context to the data, drawing the user's eye to the center or the primary action.
- **Bento-Grid Logic**: Complex dashboards are broken down into digestible, hyper-rounded "pockets" or cards, reducing cognitive load.
- **State-by-State Design**: Every component is designed not just for its "perfect" state, but for empty states, loading states, error states, and interaction states.

## 2. Colors & Vibe

The palette uses deep blues for structural trust, but introduces vibrant status colors to make data visualization pop (as seen in modern SaaS dashboards).

- **Primary Structure**: `#004080` for main CTAs and active states.
- **Data Accents**: Use the `status-*` colors (Emerald, Amber, Rose, Blue) for charts, progress bars, and pill badges to create a dynamic, readable interface.
- **Surfaces**: Extremely subtle borders (`#F1F5F9`) and soft, dispersed shadows replace heavy lines, creating a floating, modern aesthetic.

## 3. Motion & Micro-interactions (The "Anti-Boring" Layer)

Static is boring. Movement provides feedback, context, and life to the interface.

- **Entrance Animations**: Elements should not just "appear". Use staggered fade-ins and subtle upward slides (`translate-y-2` to `translate-y-0`) for lists and Bento cards when a page loads.
- **Hover States**: All interactive elements (buttons, cards, sidebar links) must have a visual response. Use a slight scale down for buttons (`active:scale-[0.97]`) and a subtle lift/shadow increase for cards.
- **Text & Data Motion**: When a user reaches a goal or data loads, animate the numbers ticking up or the progress bar filling (easing curves are mandatory).
- **Parallax & Scrolling**: On marketing or landing pages, use subtle parallax effects on floating contextual elements (like doodles or 3D icons) to create depth.

## 4. Typography & Copywriting

**Inter** remains the core typeface, but the *way* we speak to the user changes.

- **Friendly over Formal**: Ditch corporate jargon. Instead of "Authentication Failure", use "We couldn't verify your credentials." Instead of "Invoice Generation Module", use "Create an Invoice".
- **Hierarchy through Weight, not just Size**: Use font weights (e.g., ExtraBold vs Regular) to create contrast inside data cards, rather than relying on massive font sizes.
- **Progressive Disclosure**: Keep default text minimal. Use tooltips and expanding sections for secondary information.

## 5. Layout & Shapes

The layout logic maximizes readability and modern aesthetics.

- **Hyper-Rounded Bento**: Standardize on `16px` to `24px` (`rounded-xl` to `rounded-3xl`) for main containers. The softness of the UI offsets the complexity of the data (like ticketing logistics or fiscal data).
- **Pill Shapes for Metadata**: Statuses, tags, and small filters should use `rounded-full`.
- **Center-Weighted Empty States**: When a table or dashboard is empty, center the illustration/doodle and the CTA. Do not leave vast amounts of blank canvas aligned to the top left.

## 6. Finishing Touches (The "Delight" Factor)

- **Empty States & 404s**: These are opportunities. Use bespoke, slightly playful illustrations or subtle animations when a user has no invoices or reaches a dead link.
- **Tasteful Contextual Art**: If a section feels too empty, don't just make the box smaller. Add a tasteful, low-opacity background element or a subtle icon that gives context to what the user should be doing there.

## 7. Strict Do's and Don'ts

- **DO** map out all features and their UX states *before* building the UI components.
- **DO** use `cubic-bezier` easing for all animations so they feel natural, not robotic.
- **DO** use highly contrasting, friendly text copy to guide the user.
- **DON'T** use heavy, dark drop shadows. Use large spread, low opacity, tinted shadows (e.g., `shadow-blue-900/5`).
- **DON'T** clutter the edges. Keep padding generous (`p-5` or `p-6` inside cards) so the content breathes.
- **DON'T** use default browser outlines. Implement custom `focus-visible:ring-2` with an offset that matches the brand colors.