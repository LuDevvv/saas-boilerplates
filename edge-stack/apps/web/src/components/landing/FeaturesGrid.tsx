import React from "react";
import {
  Zap,
  ShieldCheck,
  CreditCard,
  Users,
  Cpu,
  Layers,
  Code2,
  Database,
  Activity,
  Terminal,
  Orbit,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui";

const features = [
  {
    title: "V8 Isolated Runtime",
    description:
      "Built for Cloudflare Workers. Sub-millisecond cold starts and deterministic global execution.",
    icon: <Zap className="w-6 h-6" />,
    color: "brand-primary",
  },
  {
    title: "Federated Billing",
    description:
      "Native integration with Stripe, LemonSqueezy, and Polar. Synchronized subscription states.",
    icon: <CreditCard className="w-6 h-6" />,
    color: "brand-blue",
  },
  {
    title: "Serverless Postgres",
    description:
      "Drizzle ORM with Neon. High-integrity data residency with branching and edge-compatible drivers.",
    icon: <Database className="w-6 h-6" />,
    color: "brand-teal",
  },
  {
    title: "Namespace Isolation",
    description:
      "Multi-tenant workspace architecture with granular RBAC and high-fidelity member management.",
    icon: <Users className="w-6 h-6" />,
    color: "brand-primary",
  },
  {
    title: "Hono Core API",
    description:
      "Ultra-fast routing framework with standard Web APIs and exhaustive middleware validation.",
    icon: <Cpu className="w-6 h-6" />,
    color: "brand-blue",
  },
  {
    title: "Turborepo Orchestration",
    description:
      "Industrial monorepo structure for shared assets, UI systems, and zero-trust pipelines.",
    icon: <Layers className="w-6 h-6" />,
    color: "brand-teal",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20 space-y-4 animate-premium-in">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-[#E1E5EB]" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C1C7D0] italic">
              System Capabilities
            </p>
            <div className="h-[1px] w-8 bg-[#E1E5EB]" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-[#1A1D1F] tracking-tighter italic leading-none">
            EVERYTHING YOU NEED TO SHIP{" "}
            <span className="text-premium-gradient">FAST.</span>
          </h2>
          <p className="text-lg text-[#8E95A2] font-semibold italic max-w-2xl">
            We've integrated the high-integrity protocols of the modern web so
            you can focus on building core innovation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="animate-premium-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <Card className="dashboard-card group h-full border-none bg-white shadow-xl shadow-black/[0.02] hover:shadow-2xl hover:shadow-black/[0.05] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F8F9FB] rounded-bl-[4rem] group-hover:bg-[#1A1D1F] transition-colors duration-500 -mr-8 -mt-8 flex items-end justify-start p-10">
                  <Terminal className="w-4 h-4 text-[#C1C7D0] group-hover:text-white/20 transition-colors" />
                </div>
                <CardHeader className="p-10">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-[#F8F9FB] flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm border border-[#F1F3F6] text-[#1A1D1F] group-hover:bg-[#1A1D1F] group-hover:text-white`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-2xl font-black text-[#1A1D1F] tracking-tighter italic mb-4 group-hover:text-premium-gradient transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-md text-[#8E95A2] font-semibold italic leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <div className="px-10 pb-10">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#C1C7D0] italic group-hover:text-[#1A1D1F] transition-colors">
                    <Orbit className="w-3.5 h-3.5 animate-spin-slow" />
                    Active Module
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
