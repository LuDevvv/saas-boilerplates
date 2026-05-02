---
trigger: always_on
---

Design System Specification (V4.0)

This document provides a comprehensive reverse-engineered specification of the **Azteli Dashboard UI**. It defines the core design philosophy, visual identity, layout logic, and component architecture required to maintain and scale the product's premium SaaS aesthetic.

---

## 1. Design Philosophy

The Azteli UI follows a **Soft Premium Enterprise** philosophy. It balances high-density data management with a spacious, airy feel through "Glassmorphism Lite" and "Bento-style" layout logic.

*   **Core Philosophy**: Functional Minimalism with a Premium Edge.
*   **Emotional Tone**: Professional, trustworthy, yet modern and vibrant.
*   **Prioritization**: Clarity and scannability are prioritized over absolute density.
*   **Psychological Principles**:
    *   **Aesthetic-Usability Effect**: High-fidelity visuals (gradients, rounded corners) increase user patience and perceived value.
    *   **Proximity**: Grouping related metrics in "Bento cards" to reduce cognitive load.
    *   **Motion as Feedback**: Subtle scaling and transitions provide a sense of reactivity and "life" to the interface.

---

## 2. Visual Identity System

The visual DNA is defined by depth, soft surfaces, and extreme corner rounding.

*   **Shape Language**: Hyper-rounded. Corner radii range from 12px (`xl`) to 40px (`6xl`), creating a "pill-like" and friendly atmosphere.
*   **Surface Layer System**: 
    *   **Canvas**: Solid `#FFFFFF` or `#0A0A0A` (Dark).
    *   **Elevated Surfaces**: Glassmorphic cards with `backdrop-blur-md` and `bg-white/80` or `bg-white/5`.
*   **Elevation System**: Uses "Glow Shadows" rather than traditional muddy shadows. Focuses on `shadow-sm` for persistence and `shadow-xl` for interaction.
*   **Contrast Hierarchy**: Subtle. Border colors are kept close to the background (`gray-100` / `white/10`) to allow content to lead.
*   **Border Philosophy**: 1px solid borders are mandatory for cards and navigation to define structure without adding visual weight.

---

## 3. Layout & Grid System

The layout is a hybrid of a structured sidebar/navbar and a flexible bento-grid main content area.

*   **Grid System**: 12-column layout (standard) but components primarily align to a **Bento Grid** logic.
*   **Sidebar Dimensions**: 
    *   **Expanded**: 224px (`w-56`).
    *   **Collapsed**: 72px (`w-[72px]`).
*   **Header Sizing**: Fixed 64px (`h-16`) with sticky positioning.
*   **Spacing Rhythm**: 8px-based system (Tailwind defaults).
    *   **Gaps**: `gap-6` (24px) for section spacing; `gap-4` (16px) for internal component spacing.
    *   **Padding**: `p-6` (24px) for standard cards; `p-8` (32px) for hero sections.
*   **Max Width**: Content is constrained to `max-w-[1920px]` but optimized for 1440px scanning.

---

## 4. Typography System

**Font Family**: `Inter` (Sans-serif) is the exclusive typeface.

| Typography Role | Estimated Size | Weight | Line Height | Letter Spacing | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Heading** | 32px | 900 (Black) | 1.1 | -0.05em | Main dashboard greeting |
| **KPI Value** | 30px-32px | 700 (Bold) | 1.0 | -0.025em | Main metric numbers |
| **Section Title** | 18px | 700 (Bold) | 1.25 | -0.01em | Card headers, list titles |
| **Body Text** | 14px | 400-500 | 1.5 | Normal | Standard descriptions |
| **Navigation** | 14px | 500 (Medium) | Normal | -0.01em | Sidebar/Navbar links |
| **Caption/Label** | 11px-12px | 800 (Extra) | Normal | 0.2em (Uppercase) | Metadata, small labels |
| **Badge** | 10px | 700 (Bold) | Normal | 0.1em (Uppercase) | Status indicators, counts |

---

## 5. Color System

The palette is desaturated with high-chroma primary and secondary accents.

| Token | HEX / Value | Usage |
| :--- | :--- | :--- |
| **Primary (Brand)** | `#7144F9` | Buttons, Active states, Primary KPI cards |
| **Secondary (Teal)** | `#06D3BE` | Success states, Secondary accents |
| **Accent (Blue)** | `#7CAEF5` | Info states, Support elements |
| **Background (Light)** | `#FFFFFF` | Main canvas (Light mode) |
| **Background (Dark)** | `#0A0A0A` | Main canvas (Dark mode) |
| **Surface** | `white/80` (L) / `white/5` (D) | Cards, Modals, Navbar |
| **Border** | `gray-100` (L) / `white/10` (D) | Soft separators |
| **Text Primary** | `gray-900` / `white` | Headings, Main values |
| **Text Secondary** | `gray-500` / `gray-400` | Subtext, Descriptions |

---

## 6. Component System

### 6.1 Cards (`card-premium`)
*   **Structure**: Container -> Header -> Body.
*   **Styling**: `rounded-[20px]`, `border-gray-100`, `shadow-sm`.
*   **States**: Hover scales by 1% (`hover:scale-[1.01]`) and deepens shadow to `shadow-md`.

### 6.2 Buttons (`btn-base`)
*   **Primary**: `bg-gradient-to-r from-blue-600 to-blue-700`, `rounded-2xl`, `shadow-lg shadow-blue-500/20`.
*   **Secondary**: `border-gray-200`, `bg-white`, `text-gray-700`.
*   **Interaction**: `active:scale-95` (Mandatory), `transition-all duration-300`.

### 6.3 Sidebar Items
*   **Inactive**: `text-gray-600`, `hover:bg-gray-100`.
*   **Active**: `bg-primary-50`, `text-primary-700`, `font-bold`.
*   **Indicator**: 2px width accent bar on the left (`bg-primary-600`).

### 6.4 KPI Widgets
*   **Primary Variant**: Gradient background, white text, 32px font size for value.
*   **Secondary Variant**: White background, 1px border, 30px font size for value.

---

## 7. UI Rules & Constraints (Non-Negotiables)

```markdown
UI Non-Negotiable Rules
1. ALWAYS use 8px spacing increments (Tailwind scale).
2. NEVER use browser default focus rings; use custom primary-color outlines or rings.
3. PREFER uppercase for text smaller than 12px with a minimum tracking of 0.1em.
4. CARDS must never have sharp corners; 20px (rounded-[20px]) is the standard.
5. INTERACTION feedback is mandatory: every button/link must have a scale-95 click state.
6. GRADIENTS should be subtle and diagonal (bg-gradient-to-br).
7. GLASSMORPHISM is used for fixed navigation (Navbar/Sidebar) with backdrop-blur-md.
8. SHADOWS should be tinted with the background color (e.g., shadow-indigo-500/20) rather than neutral black.
9. TYPOGRAPHY: Heading 1 must be font-black (900 weight).
```

---

## 8. Interaction & UX Behavior

*   **Motion**: Transition durations are set to `300ms` for navigation and `200ms` for button hovers.
*   **Entrance**: Main content uses a `fade-in-up` animation (`0.5s`) upon page load.
*   **Hover Logic**: Hover states should be "additive" (increase shadow/scale) rather than "replacement" (changing background drastically).
*   **Loading**: Shimmer skeletons should follow the exact shape and radius of the component they replace.

---

## 9. Design Tokens

```json
{
  "spacing": {
    "section": "24px",
    "element": "16px",
    "internal": "12px",
    "micro": "6px"
  },
  "radius": {
    "input": "12px",
    "button": "16px",
    "card": "20px",
    "hero": "32px",
    "full": "9999px"
  },
  "shadows": {
    "card": "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
    "premium": "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
    "glow": "0 0 15px rgba(113, 68, 249, 0.2)"
  }
}
```

---

## 10. UI Replication Guide

To recreate this UI from scratch:
1.  **Initialize Foundation**: Set background to `#FFFFFF` (Light) or `#0A0A0A` (Dark). Install `Inter` font.
2.  **Define Surfaces**: Use 20px radius for all cards. Add a subtle 1px border (`gray-100` or `white/10`).
3.  **Establish Navigation**: Create a sticky 64px header and 224px sidebar. Apply `backdrop-blur-md` to both.
4.  **Layout Hierarchy**: Group content into "Bento sections" using `gap-6`.
5.  **Micro-Interactions**: Add `active:scale-95` to all interactive elements.

---

## Design Rules Cheat Sheet

*   **Typography**: Inter only. Black weight for H1. 14px for body.
*   **Spacing**: 24px (gap-6) between main sections. 16px (gap-4) for internal components.
*   **Colors**: Primary `#7144F9`. Gray scale must include `#0A0A0A`.
*   **Layout**: Collapsible sidebar (224px -> 72px). Bento grid for home pages.
*   **Forbidden**: No sharp corners. No saturated yellow/orange for focus. No muddy shadows. No generic 16px border-radius (too small).

---

### Summary of reverse-engineering
The Azteli design system is a high-fidelity implementation of modern SaaS patterns, characterized by **hyper-rounded corners**, **intentional micro-interactions**, and **layered glass surfaces**. It creates a "soft" interface that feels premium through the use of vibrant gradients and generous white space.