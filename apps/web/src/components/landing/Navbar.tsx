import React, { useState, useEffect } from "react";
import { Button, cn } from "@workspace/ui";
import { Logo } from "../Logo";
import { Menu, X, Github, Activity, Command } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Tech Stack", href: "#stack" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/70 backdrop-blur-xl border-b border-[#F1F3F6] py-3 shadow-xl shadow-black/[0.02]"
          : "bg-transparent py-6",
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl bg-[#1A1D1F] flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <Logo className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl italic tracking-tighter text-[#1A1D1F] leading-none">
              EDGESTACK
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#C1C7D0] leading-none mt-1">
              EDGE-PROTOCOL
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E95A2] hover:text-[#1A1D1F] transition-all duration-300 relative group/link italic"
            >
              {link.name}
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[hsl(var(--brand-primary))] group-hover/link:w-full transition-all duration-500" />
            </a>
          ))}
          <a
            href="https://github.com/LuDevvv/startup-edge-stack"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C1C7D0] hover:text-[#1A1D1F] transition-colors duration-300"
            aria-label="GitHub Repository"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>

        {/* Auth CTAs */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="/login"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1D1F] hover:opacity-70 transition-opacity italic"
          >
            Initialize
          </a>
          <a href="/register" className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-teal))] rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
            <Button className="relative bg-[#1A1D1F] hover:bg-black text-white rounded-xl px-8 h-12 font-black italic text-[10px] uppercase tracking-[0.2em] border-none shadow-xl shadow-black/10">
              Launch Node
            </Button>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden w-12 h-12 rounded-2xl bg-[#F8F9FB] border border-[#F1F3F6] flex items-center justify-center text-[#1A1D1F]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-[#F1F3F6] shadow-2xl animate-in slide-in-from-top duration-500 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-teal))]" />
          <div className="flex flex-col p-10 gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-2xl font-black italic tracking-tighter text-[#1A1D1F]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="h-[1px] w-full bg-[#F1F3F6]" />
            <div className="flex flex-col gap-4">
              <a href="/login" className="w-full">
                <Button
                  variant="ghost"
                  className="w-full h-14 rounded-2xl font-black italic text-[#1A1D1F]"
                >
                  Initialize Session
                </Button>
              </a>
              <a href="/register" className="w-full">
                <Button className="w-full h-14 rounded-2xl bg-[#1A1D1F] font-black italic">
                  Launch Environment
                </Button>
              </a>
            </div>
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] text-[#C1C7D0] italic">
              <span>V8-ISOLATE-NATIVE</span>
              <span>2026.PROTO</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
