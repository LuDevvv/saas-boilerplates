import { HeroSection, PricingTable, WaitlistForm } from "@node-stack/ui";

const pricingTiers = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for exploring the possibilities.",
    features: ["Up to 3 projects", "Basic analytics", "Community support"],
    cta: "Start for Free",
  },
  {
    name: "Pro",
    price: "$29",
    description: "Everything you need to scale your business.",
    features: ["Unlimited projects", "Advanced AI integration", "Priority support", "Custom domains"],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Dedicated infrastructure for large teams.",
    features: ["SSO & SAML", "Custom RLS policies", "24/7 Dedicated account manager", "SLA guarantees"],
    cta: "Contact Sales",
  },
];

export default function LandingPage() {
  return (
    <main>
      <HeroSection
        title={
          <>
            Build your SaaS <span className="text-primary-500">faster</span> than ever before
          </>
        }
        subtitle="The production-ready monorepo with NestJS, Next.js, and Drizzle. Everything you need to go from zero to one."
        ctaText="Join the Waitlist"
      />

      <section id="waitlist" className="bg-gray-50 py-20">
        <div className="container flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Early Access
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join 500+ developers building the future. Get notified when we launch.
          </p>
          <div className="mt-10">
            <WaitlistForm />
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose the plan that fits your stage. Scale as you grow.
            </p>
          </div>
          <PricingTable tiers={pricingTiers} />
        </div>
      </section>

      <footer className="border-t border-gray-100 py-12">
        <div className="container flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-xl font-bold text-gray-900">Node Stack</div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="/terms" className="hover:text-primary-500 transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-primary-500 transition-colors">Privacy</a>
            <a href="/blog" className="hover:text-primary-500 transition-colors">Blog</a>
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Node Stack. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
