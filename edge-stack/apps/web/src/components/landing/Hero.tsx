import React from "react";
import { Button } from "@workspace/ui";
import {
  ArrowRight,
  Github,
  Zap,
  Shield,
  Globe,
  Activity,
  Command,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 md:pt-56 md:pb-40 overflow-hidden">
      {/* Background Decorative Elements - EdgeStack Style */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[60%] h-[60%] bg-[hsl(var(--brand-primary))] rounded-full blur-[160px] opacity-[0.07] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-[hsl(var(--brand-blue))] rounded-full blur-[140px] opacity-[0.05]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(#000 0.5px, transparent 0.5px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Scanning Line Effect */}
        <div
          className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--brand-primary))] to-transparent opacity-10 animate-scan"
          style={{ top: "20%" }}
        />
      </div>

      <div className="container mx-auto px-6 text-center">
        {/* Industrial Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-white border border-[#F1F3F6] shadow-xl shadow-black/[0.02] mb-12 animate-premium-in">
          <div className="w-2 h-2 rounded-full bg-[#16C8C7] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            EdgeStack v1.0.Beta Enabled
          </span>
          <Activity className="w-3.5 h-3.5 text-[#C1C7D0]" />
        </div>

        {/* High-Integrity Headline */}
        <div
          className="space-y-4 mb-12 animate-premium-in"
          style={{ animationDelay: "200ms" }}
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter italic leading-[0.85]">
            BUILD AT THE
            <br />
            <span className="text-premium-gradient">EDGE PROTOCOL.</span>
          </h1>
          <div className="flex items-center justify-center gap-4 text-[10px] font-black text-[#C1C7D0] uppercase tracking-[0.5em] italic">
            <Command className="w-4 h-4" />
            <span>Deterministic Scale Globally</span>
            <Command className="w-4 h-4" />
          </div>
        </div>

        <p
          className="max-w-2xl mx-auto text-lg md:text-xl text-[#8E95A2] font-semibold mb-16 italic animate-premium-in leading-relaxed"
          style={{ animationDelay: "400ms" }}
        >
          The strictly typed boilerplate for V8 Isolates. High-integrity Auth,
          Enterprise Billing, and Namespace Isolation ready for production.
        </p>

        {/* CTAs - EdgeStack Style */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-8 animate-premium-in"
          style={{ animationDelay: "600ms" }}
        >
          <a href="/register" className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-blue))] rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-500" />
            <Button className="relative bg-[#1A1D1F] hover:bg-black text-white h-16 px-12 rounded-2xl text-xs font-black uppercase tracking-[0.2em] italic transition-all duration-500 group shadow-2xl border-none">
              Initialize Environment
              <ArrowRight
                className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-2"
                strokeWidth={3}
              />
            </Button>
          </a>
          <a
            href="https://github.com/LuDevvv/startup-edge-stack"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Button
              variant="ghost"
              className="h-16 px-12 rounded-2xl text-xs font-black uppercase tracking-[0.2em] italic text-[#1A1D1F] border border-[#F1F3F6] bg-white shadow-xl shadow-black/[0.02] group-hover:bg-[#F8F9FB] transition-all duration-500"
            >
              <Github className="mr-3 w-5 h-5" />
              Access Source Node
            </Button>
          </a>
        </div>

        {/* Performance Metrics / Social Proof */}
        <div
          className="mt-32 pt-16 border-t border-[#F1F3F6] flex flex-wrap justify-center gap-x-24 gap-y-12 animate-premium-in"
          style={{ animationDelay: "800ms" }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F8F9FB] flex items-center justify-center text-[#1A1D1F]">
              <Globe className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-lg font-black italic tracking-tighter text-[#1A1D1F]">
                GLOBAL
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C1C7D0]">
                Multi-Region Distribution
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F8F9FB] flex items-center justify-center text-[#16C8C7]">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div className="text-center">
              <p className="text-lg font-black italic tracking-tighter text-[#1A1D1F]">
                50MS
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C1C7D0]">
                Sub-Zero Latency Floor
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F8F9FB] flex items-center justify-center text-[hsl(var(--brand-primary))]">
              <Shield className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-lg font-black italic tracking-tighter text-[#1A1D1F]">
                V8-SECURE
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C1C7D0]">
                Industrial Isolation
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
