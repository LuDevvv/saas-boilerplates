import { SettingsLayout } from "./SettingsLayout";
import { ConnectedAccounts } from "./ConnectedAccounts";
import { TwoFactorSetup } from "./TwoFactorSetup";
import { ShieldCheck } from "lucide-react";

export function SettingsSecurityView() {
  return (
    <SettingsLayout activeTab="security">
      <div className="space-y-10">
        <div className="dashboard-card border-none p-8 flex items-center justify-between group">
          <div>
            <h3 className="text-xl font-bold text-[#1A1D1F]">
              Password & Security
            </h3>
            <p className="text-sm font-medium text-[#8E95A2] mt-0.5">
              Manage your account protection and sign-in methods.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E7F6FF] flex items-center justify-center text-[hsl(var(--brand-blue))] transition-transform group-hover:scale-110">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <TwoFactorSetup />

        <ConnectedAccounts />
      </div>
    </SettingsLayout>
  );
}
