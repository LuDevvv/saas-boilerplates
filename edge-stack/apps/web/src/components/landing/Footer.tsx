import React from "react";
import { Logo } from "../Logo";
import {
  Github,
  Twitter,
  Linkedin,
  Command,
  Activity,
  Terminal,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1A1D1F] text-white border-t border-white/5 py-24 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[hsl(var(--brand-primary))] rounded-full blur-[200px] opacity-[0.03] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="md:col-span-4 space-y-8">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1A1D1F] shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                <Logo className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl italic tracking-tighter leading-none">
                  EDGESTACK
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#8E95A2] leading-none mt-1">
                  EDGE-PROTOCOL
                </span>
              </div>
            </div>

            <p className="text-sm text-[#8E95A2] font-semibold italic leading-relaxed max-w-sm">
              The definitive high-integrity boilerplate for strictly typed,
              edge-native SaaS applications. Engineered for deterministic global
              scaling and zero-latency execution.
            </p>

            <div className="flex items-center gap-4 pt-4">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:text-[hsl(var(--brand-primary))] transition-all duration-500 group"
              >
                <Twitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://github.com/LuDevvv/startup-edge-stack"
                target="_blank"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:text-[hsl(var(--brand-teal))] transition-all duration-500 group"
              >
                <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--brand-primary))] italic">
              Module Node 01
            </h4>
            <ul className="space-y-4 text-sm font-black italic tracking-tighter text-[#8E95A2]">
              <li>
                <a
                  href="#features"
                  className="hover:text-white transition-colors"
                >
                  Cluster Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-white transition-colors"
                >
                  Resource Pricing
                </a>
              </li>
              <li>
                <a
                  href="/register"
                  className="hover:text-white transition-colors"
                >
                  Initialize Access
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--brand-blue))] italic">
              External Protocols
            </h4>
            <ul className="space-y-4 text-sm font-black italic tracking-tighter text-[#8E95A2]">
              <li>
                <a
                  href="https://github.com/LuDevvv/startup-edge-stack"
                  target="_blank"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  Protocol Documentation <Terminal className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://hono.dev"
                  target="_blank"
                  className="hover:text-white transition-colors"
                >
                  Hono API Docs
                </a>
              </li>
              <li>
                <a
                  href="https://astro.build"
                  target="_blank"
                  className="hover:text-white transition-colors"
                >
                  Astro Framework
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--brand-teal))] italic">
              Compliance Policy
            </h4>
            <ul className="space-y-4 text-sm font-black italic tracking-tighter text-[#8E95A2]">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Security Isolation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Data Residency
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Operations
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              © 2026 EDGESTACK. GLOBAL ACCESS AUTHORIZED.
            </p>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <Activity className="w-3 h-3 text-[#16C8C7]" />
              <span className="text-[8px] font-black tracking-widest text-[#8E95A2]">
                SYSTEMS-ONLINE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-10 grayscale opacity-40">
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-black uppercase tracking-[0.3em] text-[#C1C7D0]">
                Powered By
              </span>
              <span className="text-[9px] font-black italic tracking-tighter">
                CLOUDFLARE V8
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-black uppercase tracking-[0.3em] text-[#C1C7D0]">
                Database
              </span>
              <span className="text-[9px] font-black italic tracking-tighter">
                NEON SERVERLESS
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
