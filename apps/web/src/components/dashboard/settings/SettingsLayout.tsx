import React from "react";
import { AppShell } from "../AppShell";
import { User, Shield, CreditCard, ChevronRight } from "lucide-react";
import { cn } from "@workspace/ui";

interface SettingsLayoutProps {
  children: React.ReactNode;
  activeTab?: "profile" | "security" | "billing";
}

export function SettingsLayout({
  children,
  activeTab = "profile",
}: SettingsLayoutProps) {
  const navItems = [
    { id: "profile", label: "Profile", href: "/settings", icon: User },
    {
      id: "security",
      label: "Security",
      href: "/settings/security",
      icon: Shield,
    },
    { id: "billing", label: "Billing", href: "/billing", icon: CreditCard },
  ];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1D1F]">
            Settings
          </h1>
          <p className="text-[#8E95A2] mt-1 text-sm font-medium">
            Manage your personal information and account security.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-72 shrink-0">
            <nav className="flex flex-col gap-2">
              <p className="text-[10px] font-black text-[#8E95A2] uppercase tracking-[0.2em] px-4 mb-2">
                Account Control
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group",
                      isActive
                        ? "bg-[hsl(var(--brand-primary))] text-white shadow-lg shadow-[hsl(var(--brand-primary))/20]"
                        : "text-[#8E95A2] hover:bg-[#F8F9FB] hover:text-[#1A1D1F]",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          isActive
                            ? "text-white"
                            : "text-[#8E95A2] group-hover:text-[#1A1D1F]",
                        )}
                      />
                      <span className="font-bold text-sm tracking-tight">
                        {item.label}
                      </span>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-white/70" />
                    )}
                  </a>
                );
              })}
            </nav>
          </aside>

          <div className="flex-1 w-full animate-in fade-in duration-500 delay-150">
            {children}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
