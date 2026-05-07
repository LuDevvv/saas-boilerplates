import { FC, useState, useEffect } from "react";
import { Button, Input } from "@node-stack/ui";
import { QRCodeSVG } from "qrcode.react";
import {
  ShieldCheck, Copy, CheckCircle2, AlertCircle,
  Loader2, X, ArrowLeft,
} from "lucide-react";
import { useEnable2fa, useVerify2fa } from "../../auth/hooks/use2faMutations";
import { appToast } from "@components/alerts/Toasts";
import { ModalLayout } from "@/layouts/ModalLayout";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TwoFactorModal: FC<TwoFactorModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"loading" | "setup" | "verify">("loading");
  const [secretData, setSecretData] = useState<{ secret: string; otpAuthUrl: string } | null>(null);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  const { mutateAsync: enable2fa } = useEnable2fa();
  const { mutateAsync: verify2fa, isPending: isVerifying } = useVerify2fa();

  // Kick off 2FA setup when opened; reset on close
  useEffect(() => {
    let t: any = null;
    
    if (isOpen) {
      handleSetup();
    } else {
      t = setTimeout(() => {
        setStep("loading");
        setSecretData(null);
        setCode("");
        setCopied(false);
      }, 350);
    }
    
    return () => {
      if (t) clearTimeout(t);
    };
  }, [isOpen]);

  const handleSetup = async () => {
    try {
      setStep("loading");
      const data = await enable2fa();
      setSecretData({
        secret: data.secret,
        otpAuthUrl: (data as any).otpAuthUrl || (data as any).otpauthUrl,
      });
      setStep("setup");
    } catch {
      onClose();
    }
  };

  const handleCopy = () => {
    if (secretData?.secret) {
      navigator.clipboard.writeText(secretData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    try {
      const result = await verify2fa({ token: code });
      if (result.enabled) {
        appToast.success({
          title: "¡2FA Activado!",
          description: "Tu cuenta ahora está protegida con seguridad de dos pasos.",
        });
        onClose();
      }
    } catch {
      appToast.error({
        title: "Código inválido",
        description: "El código introducido no es correcto o ha expirado.",
      });
      setCode("");
    }
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      variant="modal"
      size="sm"
      showCloseButton={false}
      contentClassName="!pt-0"
      zIndex={300}
    >
      {/* Gradient accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-primary via-cyan-400 to-primary" />

      {/* Custom header with conditional back button */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          {step === "verify" && (
            <button
              onClick={() => setStep("setup")}
              className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-surface-hover text-gray-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h3 className="text-[15px] font-bold text-fg">
            Seguridad 2FA
          </h3>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-gray-100 dark:hover:bg-surface-hover text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {/* Loading */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-[11px] font-bold text-gray-400 uppercase  animate-pulse">
              Generando secreto...
            </p>
          </div>
        )}

        {/* Setup: QR + manual secret */}
        {step === "setup" && secretData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
            <p className="text-[13px] text-fg-secondary leading-relaxed text-center">
              Escanea este código con tu aplicación de autenticación para vincular tu cuenta.
            </p>

            <div className="flex flex-col items-center gap-5">
              {/* QR */}
              <div className="p-4 bg-white rounded-[20px] shadow-bento border border-border group transition-transform hover:scale-[1.02]">
                <QRCodeSVG
                  value={secretData.otpAuthUrl}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* Manual secret */}
              <div className="w-full bg-surface-muted rounded-[16px] p-4 border border-border">
                <p className="text-[10px] font-bold text-gray-400 uppercase  mb-3 text-center">
                  Configuración Manual
                </p>
                <div className="flex items-center gap-2 bg-white dark:bg-canvas rounded-xl p-1.5 border border-border">
                  <code className="flex-1 text-center font-mono text-[12px] font-bold text-gray-600 dark:text-cyan-400  truncate px-2">
                    {secretData.secret}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-hover transition-all active:scale-90"
                    title="Copiar código"
                  >
                    {copied
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      : <Copy className="h-4 w-4 text-gray-400" />
                    }
                  </button>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep("verify")}
              className="w-full h-11 rounded-[14px] bg-primary hover:bg-primary-600 text-white font-bold uppercase text-[11px] shadow-lg shadow-primary/20 active:scale-[0.98]"
            >
              Siguiente: Verificar código
            </Button>
          </div>
        )}

        {/* Verify: code input */}
        {step === "verify" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-400">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-[16px] bg-primary/10 flex items-center justify-center border border-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <p className="text-[13px] text-fg-secondary leading-relaxed text-center px-4">
                Ingresa el código de 6 dígitos que aparece ahora en tu aplicación.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="h-16 text-center text-3xl font-black rounded-[16px] bg-gray-50/50 dark:bg-white/5"
                autoFocus
              />

              <Button
                onClick={handleVerify}
                disabled={code.length !== 6 || isVerifying}
                className="w-full h-11 rounded-[14px] bg-primary hover:bg-primary-600 text-white font-bold uppercase text-[11px] shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                {isVerifying
                  ? <Loader2 className="h-5 w-5 animate-spin" />
                  : "Confirmar y Activar 2FA"
                }
              </Button>
            </div>

            <div className="p-4 rounded-[14px] bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/10 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                Guarda tu llave de recuperación. Si pierdes acceso a tu app de autenticación, será la única forma de recuperar tu cuenta.
              </p>
            </div>
          </div>
        )}
      </div>
    </ModalLayout>
  );
};
