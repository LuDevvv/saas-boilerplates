import { useState } from "react";
import { useUser } from "../../../hooks/useUser";
import { Button } from "@workspace/ui";
import { client } from "../../../lib/api";
import { toast } from "sonner";
import { Loader2, Link as LinkIcon, Unlink, Globe } from "lucide-react";

const PROVIDERS = [
  {
    id: "google",
    name: "Google",
    color: "#DB4437",
  },
  {
    id: "github",
    name: "GitHub",
    color: "#181717",
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "#1877F2",
  },
];

export function ConnectedAccounts() {
  const { user, updateUser } = useUser();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="animate-pulse bg-[#F8F9FB] rounded-2xl h-48 w-full mt-10"></div>
    );
  }

  const connectedAccounts = user.accounts || [];

  const handleConnect = async (provider: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      window.location.href = `${import.meta.env.PUBLIC_API_URL || "http://localhost:8787"}/api/auth/link/${provider}?token=${token}`;
    } catch (error) {
      toast.error("Failed to initiate connection");
    }
  };

  const handleDisconnect = async (provider: string) => {
    setLoadingProvider(provider);
    try {
      const authApi = (client.api.auth.accounts as any)[":provider"];
      const res = await authApi.$delete({
        param: { provider },
      });

      if (res.ok) {
        toast.success(`${provider} account disconnected`);
        updateUser({
          accounts: connectedAccounts.filter((p: string) => p !== provider),
        });
      } else {
        const data = await res.json();
        toast.error(data.error?.message || "Failed to disconnect account");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="dashboard-card border-none overflow-hidden group/card mt-10">
      <div className="p-8 border-b border-[#F8F9FB] flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#1A1D1F]">
            Connected Accounts
          </h3>
          <p className="text-sm font-medium text-[#8E95A2] mt-0.5">
            Link social accounts to easily switch devices and log in faster.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#F8F9FB] flex items-center justify-center text-[#8E95A2] group-hover/card:text-[hsl(var(--brand-primary))] transition-colors">
          <LinkIcon className="w-5 h-5" />
        </div>
      </div>

      <div className="p-8 space-y-3">
        {PROVIDERS.map((provider) => {
          const isConnected = connectedAccounts.includes(provider.id);
          const isLoading = loadingProvider === provider.id;

          return (
            <div
              key={provider.id}
              className="flex items-center justify-between p-5 bg-[#F8F9FB] hover:bg-white border border-transparent hover:border-[#F1F3F6] rounded-2xl transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#F1F3F6] group-hover:scale-105 transition-transform">
                  <Globe
                    className="w-6 h-6"
                    style={{ color: provider.color }}
                  />
                </div>
                <div>
                  <p className="font-black text-[#1A1D1F] text-sm tracking-tight">
                    {provider.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-[#16C8C7]" : "bg-[#8E95A2]"}`}
                    />
                    <p className="text-[10px] font-black text-[#8E95A2] uppercase tracking-widest">
                      {isConnected ? "Linked to account" : "No connection"}
                    </p>
                  </div>
                </div>
              </div>

              {isConnected ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => handleDisconnect(provider.id)}
                  className="rounded-xl font-bold text-xs text-red-500 hover:bg-red-50 hover:text-red-600 px-4 h-10"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Unlink className="mr-2 h-3.5 w-3.5" />
                  )}
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => handleConnect(provider.id)}
                  className="bg-white border border-[#F1F3F6] text-[#1A1D1F] hover:bg-[#1A1D1F] hover:text-white rounded-xl font-bold text-xs px-6 h-10 shadow-sm transition-all"
                >
                  Connect Account
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-[#F8F9FB] border-t border-[#F1F3F6] px-8 py-4">
        <p className="text-[10px] font-black text-[#8E95A2] uppercase tracking-[0.2em] text-center">
          Multi-Provider Federation Enabled
        </p>
      </div>
    </div>
  );
}
