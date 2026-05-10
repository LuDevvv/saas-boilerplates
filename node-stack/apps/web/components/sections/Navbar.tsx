"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate } from "@motionone/dom";
import clsx from "clsx";

const NAV_LINKS = [
  { label: "Features",      href: "#features"     },
  { label: "How it works",  href: "#how-it-works"  },
  { label: "Pricing",       href: "#pricing"       },
  { label: "FAQ",           href: "#faq"           },
] as const;

function HexLogo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M16 2L28.124 9V23L16 30L3.876 23V9L16 2Z"
        fill="url(#hex-grad)"
      />
      <path
        d="M11 16.5L14.5 20L21 12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="hex-grad" x1="3.876" y1="2" x2="28.124" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-primary-400)" />
          <stop offset="1" stopColor="var(--color-primary-700)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      className="transition-transform duration-300"
    >
      <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      {open ? (
        <>
          <line x1="4" y1="4" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="4" x2="4" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1="3" y1="7"  x2="19" y2="7"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="3" y1="15" x2="19" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const headerRef                     = useRef<HTMLElement>(null);
  const drawerRef                     = useRef<HTMLDivElement>(null);

  // Scroll detection + @motionone/dom border/bg transition
  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > 20;
      if (past === scrolled) return;
      setScrolled(past);

      if (headerRef.current) {
        if (past) {
          animate(
            headerRef.current,
            { boxShadow: ["0 0 0 0 transparent", "0 1px 0 0 rgba(226,232,240,0.5)"] },
            { duration: 0.25, easing: [0.16, 1, 0.3, 1] }
          );
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrolled]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      ref={headerRef}
      className={clsx(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-neutral-200/50"
          : "bg-transparent"
      )}
    >
      <nav
        aria-label="Main navigation"
        className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-neutral-900 hover:opacity-80 transition-opacity"
          aria-label="NodeStack home"
        >
          <HexLogo />
          <span className="text-lg tracking-tight">NodeStack</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className="animated-underline px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors rounded-md focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#pricing"
            className="inline-flex items-center justify-center rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-all duration-200 hover:bg-primary-600 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
          >
            Get Started
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <MenuIcon open={mobileOpen} />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        id="mobile-menu"
        ref={drawerRef}
        aria-hidden={!mobileOpen}
        className={clsx(
          "md:hidden overflow-hidden transition-all duration-300 ease-out-expo",
          "bg-white/95 backdrop-blur-md border-b border-neutral-200/50"
        )}
        style={{ maxHeight: mobileOpen ? "320px" : "0px" }}
      >
        <ul className="container flex flex-col gap-1 px-4 py-4" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                onClick={closeMobile}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
          <li className="mt-2 pt-3 border-t border-neutral-100">
            <a
              href="#pricing"
              onClick={closeMobile}
              className="flex items-center justify-center rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-all duration-200 hover:bg-primary-600 active:scale-[0.98]"
            >
              Get Started
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
