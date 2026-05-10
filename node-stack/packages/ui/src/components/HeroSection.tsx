"use client";

import * as React from "react";

import { cn } from "../utils.js";
import { Button } from "./ui/Button.js";
import { useGsapReveal } from "../hooks/use-gsap-reveal.js";

export interface HeroSectionProps {
  title: string | React.ReactNode;
  subtitle: string;
  ctaText?: string;
  onCtaClick?: () => void;
  image?: string;
  className?: string;
}

export function HeroSection({
  title,
  subtitle,
  ctaText = "Get Started",
  onCtaClick,
  image,
  className,
}: HeroSectionProps): React.JSX.Element {
  const titleRef = useGsapReveal<HTMLHeadingElement>({ direction: "up", delay: 0.1 });
  const subtitleRef = useGsapReveal<HTMLParagraphElement>({ direction: "up", delay: 0.3 });
  const actionsRef = useGsapReveal<HTMLDivElement>({ direction: "up", delay: 0.5 });
  const imageRef = useGsapReveal<HTMLDivElement>({ direction: "up", delay: 0.7, distance: 100 });

  return (
    <section className={cn("relative overflow-hidden py-24 lg:py-32 bg-background", className)}>
      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <h1
            ref={titleRef}
            className="max-w-4xl text-4xl font-heading  text-foreground sm:text-6xl lg:text-7xl"
          >
            {title}
          </h1>
          <p
            ref={subtitleRef}
            className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            {subtitle}
          </p>
          <div
            ref={actionsRef}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Button size="lg" onClick={onCtaClick}>
              {ctaText}
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
        {image && (
          <div ref={imageRef} className="mt-16 flex justify-center">
            <img
              src={image}
              alt="Hero Illustration"
              className="max-w-full rounded-2xl shadow-2xl border border-border"
            />
          </div>
        )}
      </div>

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,hsl(var(--primary)/0.1),transparent)]" />
      <div className="absolute top-0 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:top-[-200px]" aria-hidden="true">
        <circle cx="500" cy="500" r="500" fill="url(#gradient)" fillOpacity="0.1" />
        <defs>
          <radialGradient id="gradient">
            <stop stopColor="hsl(var(--primary))" />
            <stop offset="1" stopColor="hsl(var(--secondary))" />
          </radialGradient>
        </defs>
      </div>
    </section>
  );
}
