import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Button, Input } from "@workspace/ui";
import { client } from "../../../lib/api";
import { useUser } from "../../../hooks/useUser";
import {
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Key,
  QrCode,
  CheckCircle2,
  ChevronRight,
  Copy,
  Save,
} from "lucide-react";

export function TwoFactorSetup() {
  const { user, updateUser } = useUser();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(
    user?.twoFactorEnabled ? 3 : 0,
  );
  const [secret, setSecret] = useState<string>("");
  const [uri, setUri] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="dashboard-card border-none p-10 flex flex-col items-center justify-center animate-pulse">
        <Loader2 className="w-10 h-10 animate-spin text-[#F1F3F6]" />
      </div>
    );
  }

  const handleSetup = async () => {
    setLoading(true);
    try {
      const tfaApi = (client.api.auth as any)["2fa"].setup;
      const res = await tfaApi.$post();
      if (res.ok) {
        const json = await res.json();
        setSecret(json.data.secret);
        setUri(json.data.uri);
        setStep(1);
      } else {
        toast.error("Failed to initiate 2FA setup");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length < 6)
      return toast.error("Please enter a valid 6-digit code");
    setLoading(true);
    try {
      const enableApi = (client.api.auth as any)["2fa"].enable;
      const res = await enableApi.$post({
        json: { token: code },
      });
      if (res.ok) {
        const json = await res.json();
        setRecoveryCodes(json.data.recoveryCodes);
        setStep(2);
        updateUser({ twoFactorEnabled: true });
        toast.success("Two-Factor Authentication enabled!");
      } else {
        const json = await res.json();
        toast.error(json.error?.message || "Invalid verification code");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card border-none overflow-hidden">
      <div className="p-8 border-b border-[#F8F9FB] flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#1A1D1F]">
            Two-Factor Authentication
          </h3>
          <p className="text-sm font-medium text-[#8E95A2] mt-0.5">
            Protect your account with an additional layer of security.
          </p>
        </div>
        {step === 3 ? (
          <div className="bg-[#EFFFF6] text-[#16C8C7] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Enabled
          </div>
        ) : (
          <div className="bg-[#FFF4F2] text-red-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Disabled
          </div>
        )}
      </div>

      <div className="p-8">
        {step === 0 && (
          <div className="max-w-md">
            <div className="bg-[#F8F9FB] border border-[#F1F3F6] p-6 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[hsl(var(--brand-primary))] shadow-sm">
                <Key className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#1A1D1F] leading-relaxed">
                Two-Factor Authentication is currently disabled. We highly
                recommend enabling it to prevent unauthorized access to your
                account.
              </p>
              <Button
                onClick={handleSetup}
                disabled={loading}
                className="bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary))/90] rounded-xl font-bold px-8"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 mr-2" />
                )}
                {loading ? "Initializing..." : "Begin Setup Process"}
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-12 animate-in fade-in duration-500">
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-black text-[#1A1D1F] uppercase tracking-widest flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#1A1D1F] text-white flex items-center justify-center text-[10px]">
                    1
                  </div>
                  Scan QR Code
                </h4>
                <p className="text-sm font-medium text-[#8E95A2]">
                  Use your preferred TOTP app (Google Authenticator, Authy, etc)
                  to scan this code.
                </p>
              </div>

              <div className="p-6 bg-white border-2 border-[#F1F3F6] rounded-3xl inline-block shadow-xl shadow-black/5">
                <QRCodeSVG value={uri} size={180} />
              </div>

              <div className="bg-[#F8F9FB] p-4 rounded-xl space-y-2 border border-[#F1F3F6]">
                <p className="text-[10px] font-black text-[#8E95A2] uppercase tracking-widest px-1">
                  Manual Secret Key
                </p>
                <div className="bg-white px-4 py-3 rounded-lg flex items-center justify-between group">
                  <code className="text-xs font-bold text-[#1A1D1F] break-all">
                    {secret}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[#8E95A2] hover:text-[#1A1D1F]"
                    onClick={() => {
                      navigator.clipboard.writeText(secret);
                      toast.success("Secret copied to clipboard");
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-8 flex flex-col">
              <div className="space-y-4">
                <h4 className="text-sm font-black text-[#1A1D1F] uppercase tracking-widest flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#1A1D1F] text-white flex items-center justify-center text-[10px]">
                    2
                  </div>
                  Verification
                </h4>
                <p className="text-sm font-medium text-[#8E95A2]">
                  Enter the 6-digit code generated by your app to complete the
                  setup.
                </p>
              </div>

              <div className="space-y-6 flex-1 flex flex-col justify-center max-w-sm">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#8E95A2] uppercase tracking-[0.2em] px-1">
                    Confirmation Code
                  </label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000 000"
                    className="rounded-xl border-[#F1F3F6] bg-[#F8F9FB] h-14 text-center tracking-[0.5em] font-black text-2xl text-[#1A1D1F] focus:bg-white transition-all shadow-inner"
                    maxLength={6}
                  />
                </div>
                <Button
                  className="w-full bg-[#1A1D1F] hover:bg-black text-white h-14 rounded-xl font-bold shadow-lg"
                  onClick={handleVerify}
                  disabled={loading || code.length < 6}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <ChevronRight className="w-5 h-5 mr-2" />
                  )}
                  Verify and Finalize
                </Button>
                <Button
                  variant="ghost"
                  className="text-[#8E95A2] font-bold text-sm"
                  onClick={() => setStep(0)}
                >
                  Cancel & Return
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="bg-[#EFFFF6] p-6 rounded-2xl flex items-center gap-4 text-[#16C8C7]">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="font-bold text-lg">
                Two-Factor Authentication is now active!
              </span>
            </div>

            <div className="space-y-6 bg-[#F8F9FB] p-8 rounded-3xl border border-[#F1F3F6]">
              <div>
                <h4 className="text-sm font-black text-[#1A1D1F] uppercase tracking-widest flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  Emergency Recovery Codes
                </h4>
                <p className="text-sm font-medium text-[#8E95A2]">
                  Keep these codes in a secure, offline location. If you lose
                  access to your authenticator device, these are the ONLY way to
                  recover your account. Each code can be used once.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {recoveryCodes.map((rc, i) => (
                  <div
                    key={i}
                    className="bg-white border border-[#F1F3F6] rounded-xl px-4 py-3 text-center font-black text-xs text-[#1A1D1F] shadow-sm select-all"
                  >
                    {rc}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#F1F3F6]">
                <Button
                  className="bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary))/90] rounded-xl font-bold flex-1 h-12 shadow-lg shadow-[hsl(var(--brand-primary))/10]"
                  onClick={() => setStep(3)}
                >
                  <Save className="w-4 h-4 mr-2" />I have saved my codes
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl border-[#F1F3F6] font-bold flex-1 h-12"
                  onClick={() => {
                    const text = recoveryCodes.join("\n");
                    navigator.clipboard.writeText(text);
                    toast.success("Recovery codes copied");
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All Codes
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-md">
            <div className="flex items-center gap-5 p-8 bg-[#EFFFF6] border-2 border-white rounded-3xl shadow-xl shadow-[#EFFFF6]/50">
              <div className="bg-[#16C8C7] p-4 rounded-2xl text-white shadow-lg shadow-[#16C8C7]/30">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-[#1A1D1F] text-lg">
                  V8 Isolate Protected
                </p>
                <p className="text-xs font-bold text-[#16C8C7] uppercase tracking-widest">
                  Double-layer security active
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
