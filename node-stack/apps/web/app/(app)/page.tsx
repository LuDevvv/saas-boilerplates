import dynamic from "next/dynamic";
import { Navbar } from "@/components/sections/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { LogoMarquee } from "@/components/sections/LogoMarquee";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/sections/Footer";
import { FAQJsonLd } from "@/components/JsonLd";

const FeatureShowcase = dynamic(
  () =>
    import("@/components/sections/FeatureShowcase").then((m) => ({
      default: m.FeatureShowcase,
    })),
  {
    ssr: true,
    loading: () => <div className="h-96 bg-neutral-50" />,
  }
);

const HowItWorksSection = dynamic(
  () =>
    import("@/components/sections/HowItWorksSection").then((m) => ({
      default: m.HowItWorksSection,
    })),
  {
    ssr: true,
    loading: () => <div className="h-96 bg-white" />,
  }
);

const TestimonialsSection = dynamic(
  () =>
    import("@/components/sections/TestimonialsSection").then((m) => ({
      default: m.TestimonialsSection,
    })),
  {
    ssr: true,
    loading: () => <div className="h-96 bg-neutral-50" />,
  }
);

const faqItems = [
  {
    question: "How long does setup take?",
    answer:
      "Under 5 minutes to clone, install, and see the app running locally.",
  },
  {
    question: "What license does NodeStack use?",
    answer: "MIT license — use it for any project, commercial or otherwise.",
  },
  {
    question: "What database does it support?",
    answer:
      "PostgreSQL with Drizzle ORM. RLS policies are Postgres-specific.",
  },
  {
    question: "Where can I deploy this?",
    answer:
      "Anywhere Node.js runs — Railway, Render, Fly.io, AWS, GCP, Azure.",
  },
  {
    question: "How do I get updates?",
    answer:
      "Pull the latest commits. Breaking changes are documented in CHANGELOG.md.",
  },
  {
    question: "Is there commercial support?",
    answer:
      "Community support on Discord. Enterprise plans include dedicated support.",
  },
  {
    question: "Which OAuth providers are supported?",
    answer:
      "Google and GitHub out of the box. Add more via Passport.js strategies.",
  },
  {
    question: "Can I use this for a commercial SaaS?",
    answer:
      "Yes. The MIT license allows full commercial use with no restrictions.",
  },
];

export default function LandingPage() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <LogoMarquee />
        <FeaturesSection />
        <StatsSection />
        <FeatureShowcase />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <FAQJsonLd items={faqItems} />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
