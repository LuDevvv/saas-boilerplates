import { FC, ReactNode } from "react";

import { cn } from "../../utils.js";

// ─── Container ───────────────────────────────────────────────────────────────

export interface TwoColumnLayoutProps {
  children: ReactNode;
  /** Tailwind gap class — defaults to `gap-6`. */
  gap?: string;
  className?: string;
}

const TwoColumnLayoutRoot: FC<TwoColumnLayoutProps> = ({
  children,
  gap = "gap-6",
  className,
}) => (
  <div
    className={cn(
      "flex flex-col lg:grid lg:grid-cols-12 lg:items-start",
      gap,
      className
    )}
  >
    {children}
  </div>
);

// ─── Main ────────────────────────────────────────────────────────────────────

export interface TwoColumnMainProps {
  children: ReactNode;
  className?: string;
}

const Main: FC<TwoColumnMainProps> = ({ children, className }) => (
  <main className={cn("min-w-0 lg:col-span-8", className)}>{children}</main>
);

// ─── Aside ───────────────────────────────────────────────────────────────────

export interface TwoColumnAsideProps {
  children: ReactNode;
  /** Place the aside on the left (col-start-1) or right (default). */
  position?: "left" | "right";
  /** Make the aside sticky on desktop. Defaults to `true`. */
  sticky?: boolean;
  className?: string;
}

const Aside: FC<TwoColumnAsideProps> = ({
  children,
  position = "right",
  sticky = true,
  className,
}) => (
  <aside
    className={cn(
      "min-w-0 lg:col-span-4",
      position === "left" && "lg:col-start-1 lg:row-start-1",
      position === "right" && "lg:col-start-9",
      sticky && "lg:sticky lg:top-6",
      className
    )}
  >
    {children}
  </aside>
);

// ─── Compound export ─────────────────────────────────────────────────────────

type TwoColumnLayoutCompound = FC<TwoColumnLayoutProps> & {
  Main: typeof Main;
  Aside: typeof Aside;
};

/**
 * 12-column responsive layout primitive used by Profile, Company, Members, Billing.
 *
 * - Mobile: stacked vertically (Main first, Aside below).
 * - Desktop (`lg+`): grid with Main spanning 8 cols and Aside spanning 4 cols.
 * - Aside is sticky by default; pass `sticky={false}` to disable.
 * - `position="left"` flips the Aside to the left side via grid `col-start-1` + `row-start-1`,
 *   while keeping the natural mobile order (Main first).
 *
 * @example
 * <TwoColumnLayout>
 *   <TwoColumnLayout.Main>...</TwoColumnLayout.Main>
 *   <TwoColumnLayout.Aside>...</TwoColumnLayout.Aside>
 * </TwoColumnLayout>
 */
export const TwoColumnLayout = TwoColumnLayoutRoot as TwoColumnLayoutCompound;
TwoColumnLayout.Main = Main;
TwoColumnLayout.Aside = Aside;

// Named exports for type imports / direct use
export { Main as TwoColumnMain, Aside as TwoColumnAside };
