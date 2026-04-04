import { useEffect, useState } from "react";
import { client } from "../../lib/api";
import { Button, Card, CardContent } from "@workspace/ui";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  MailOpen,
  ChevronRight,
} from "lucide-react";
import { toast, Toaster } from "sonner";

export function AcceptInvite() {
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "unauthorized" | "invalid"
  >("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get("token");
    if (!urlToken) {
      setStatus("invalid");
      return;
    }
    setToken(urlToken);

    const accept = async () => {
      const authToken = localStorage.getItem("token");
      if (!authToken) {
        setStatus("unauthorized");
        return;
      }

      try {
        const api = client.api as any;
        const res = await api.workspaces.invitations.accept.$post({
          json: { token: urlToken },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.error?.message || "Failed to accept invitation",
          );
        }

        setStatus("success");
        toast.success("Welcome aboard!", {
          description: "You have successfully joined the workspace.",
        });

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2500);
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message);
        toast.error("Invitation failed", {
          description: err.message,
        });
      }
    };

    accept();
  }, []);

  const handleLoginRedirect = () => {
    window.location.href = `/login?returnTo=/invites/${token}`;
  };

  const handleRegisterRedirect = () => {
    window.location.href = `/register?returnTo=/invites/${token}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] p-6 selection:bg-[hsl(var(--brand-primary))/30]">
      <Card className="max-w-md w-full dashboard-card border-none overflow-hidden animate-in fade-in zoom-in-95 duration-700">
        <div className="h-2 w-full bg-gradient-to-r from-[hsl(var(--brand-primary))] via-[hsl(var(--brand-blue))] to-[hsl(var(--brand-teal))]" />

        <CardContent className="p-10 flex flex-col items-center">
          {/* Status Icon */}
          <div className="mb-8 relative">
            {status === "loading" && (
              <div className="w-20 h-20 rounded-3xl bg-[hsl(var(--brand-primary))/5] flex items-center justify-center text-[hsl(var(--brand-primary))]">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="w-20 h-20 rounded-3xl bg-[#EFFFF6] flex items-center justify-center text-[#16C8C7] animate-in zoom-in-50 duration-500">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            )}
            {(status === "error" || status === "invalid") && (
              <div className="w-20 h-20 rounded-3xl bg-[#FFF4F2] flex items-center justify-center text-red-400">
                <XCircle className="w-10 h-10" />
              </div>
            )}
            {status === "unauthorized" && (
              <div className="w-20 h-20 rounded-3xl bg-[hsl(var(--brand-blue))/5] flex items-center justify-center text-[hsl(var(--brand-blue))]">
                <UserPlus className="w-10 h-10" />
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="text-center space-y-3 mb-10">
            <h1 className="text-2xl font-black text-[#1A1D1F] tracking-tight italic">
              {status === "loading" && "V8 Verify Isolating..."}
              {status === "invalid" && "Link Expired or Invalid"}
              {status === "unauthorized" && "Workspace Access Req."}
              {status === "success" && "Access Granted"}
              {status === "error" && "Protocol Error"}
            </h1>
            <p className="text-[#8E95A2] font-semibold text-sm leading-relaxed max-w-xs mx-auto">
              {status === "loading" &&
                "We are authenticating your workspace credentials across the global edge network."}
              {status === "invalid" &&
                "This invitation link appears to be malformed or has outlived its TTL."}
              {status === "unauthorized" &&
                "Identity confirmation required. Please sign in to finalize your workspace membership."}
              {status === "success" &&
                "Membership confirmed. Synchronizing your workspace environment now."}
              {(status === "error" && errorMessage) ||
                "An unexpected error occurred during the handshake process."}
            </p>
          </div>

          {/* Action Section */}
          <div className="w-full">
            {status === "unauthorized" && (
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleLoginRedirect}
                  className="w-full bg-[#1A1D1F] hover:bg-black text-white rounded-2xl h-14 font-black italic shadow-xl shadow-black/10 group"
                >
                  Login to Accept
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={handleRegisterRedirect}
                  variant="ghost"
                  className="w-full text-[#8E95A2] font-black uppercase tracking-[0.2em] text-[10px] h-12"
                >
                  Don't have an account? Sign Up
                </Button>
              </div>
            )}

            {status === "success" && (
              <div className="flex items-center justify-center gap-2 text-[10px] font-black text-[#16C8C7] uppercase tracking-[0.2em] animate-pulse">
                <ShieldCheck className="w-4 h-4" />
                Auto-Redirecting to Dashboard
              </div>
            )}

            {(status === "error" || status === "invalid") && (
              <Button
                onClick={() => (window.location.href = "/")}
                className="w-full bg-[#1A1D1F] hover:bg-black text-white rounded-2xl h-14 font-black italic shadow-xl shadow-black/10"
              >
                <ArrowRight className="mr-2 w-5 h-5" />
                Return to System Root
              </Button>
            )}
          </div>
        </CardContent>

        <div className="bg-[#F8F9FB] border-t border-[#F1F3F6] px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-black text-[#8E95A2] uppercase tracking-widest">
            <MailOpen className="w-3.5 h-3.5" />
            Invitation Proto: 2026.03
          </div>
          <div className="text-[10px] font-black text-[#8E95A2] uppercase tracking-[0.2em]">
            EdgeStack-SSO
          </div>
        </div>
      </Card>
      <Toaster position="top-right" richColors theme="light" />
    </div>
  );
}
