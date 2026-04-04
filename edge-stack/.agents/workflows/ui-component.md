---
description: Step-by-step workflow for scaffolding, styling, and exporting shared UI components
---

# SYSTEM DIRECTIVE: UI Component & Shared Library Workflow

## 1. WORKFLOW OVERVIEW AND ARCHITECTURAL SCOPE

This workflow governs the creation, modification, and integration of all React components within the `packages/ui` workspace. The objective is to maintain a strictly decoupled, highly reusable, and framework-agnostic design system that can be consumed by both Astro (`apps/web`) and any future React SPAs (`apps/dashboard`) without bloating the client bundle.

You must execute the following steps in exact order when requested to build or modify a UI component.

## STEP 1: COMPONENT SCAFFOLDING & ISOLATION

All components must reside inside `packages/ui/src/components/`.

- **Option A: Using Shadcn UI (Radix Primitives):** Do not run generic npx commands at the root. You must target the UI workspace.
  Command: `pnpm --filter @repo/ui dlx shadcn-ui@latest add [component_name]`
- **Option B: Custom Primitive:**
  Create a strictly typed file: `packages/ui/src/components/[component-name].tsx`.
  You must define the component interface by extending native HTML attributes (e.g., `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`).

## STEP 2: STYLING & VARIANT COMPOSITION

You must strictly use Tailwind CSS utility classes. Inline styles (`style={{...}}`) and standard CSS modules are strictly prohibited to ensure a unified design token system across the monorepo.

- **Class Merging:** You must use a utility function combining `clsx` and `tailwind-merge` (typically named `cn()`) to allow consumers to override styles safely without CSS specificity conflicts.
- **Variant Management:** For components with multiple visual states (e.g., sizes, colors, outlines), you must use `class-variance-authority` (`cva`). Avoid messy ternary operators for class names.

## STEP 3: SUBPATH EXPORT CONFIGURATION (ZERO-BARREL FILES)

To enforce aggressive tree-shaking and minimize memory overhead during Serverless/Edge rendering, you MUST NOT export the component from a root `index.ts` barrel file.

Instead, you must declare the component as a discrete subpath export in `packages/ui/package.json`.

1. Open `packages/ui/package.json`.
2. Add the subpath to the `exports` map:

```json
"exports": {
  "./[component-name]": "./src/components/[component-name].tsx",
  "./utils": "./src/lib/utils.ts"
}
```
