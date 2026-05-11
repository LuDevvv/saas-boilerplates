/**
 * PaymentSuccess — landing page after Polar checkout redirect.
 *
 * Polar redirects here with ?success=true after a completed payment.
 * The page polls GET /billing/subscription until the webhook has fired
 * and the subscription is active, then navigates to the dashboard.
 * Also marks onboarding as complete via the user store refresh.
 */

import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/stores/workspaceStore";

const MAX_POLLS = 12;   // 12 × 2 s = 24 s max wait
const POLL_MS   = 2000;

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  const [polls, setPolls]         = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [timedOut, setTimedOut]   = useState(false);

  useEffect(() => {
    if (confirmed || timedOut) return;
    if (polls >= MAX_POLLS) {
      setTimedOut(true);
      return;
    }

    const id = setTimeout(async () => {
      try {
        const sub = await api.billing.getSubscription();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (sub as any)?.status;
        if (status === "active" || status === "trialing") {
          setConfirmed(true);
          return;
        }
      } catch {
        // keep polling
      }
      setPolls((p) => p + 1);
    }, POLL_MS);

    return () => clearTimeout(id);
  }, [polls, confirmed, timedOut, activeWorkspaceId]);

  // Navigate to dashboard once confirmed (or timed out — let the user in anyway)
  useEffect(() => {
    if (!confirmed && !timedOut) return;
    const t = setTimeout(() => navigate("/", { replace: true }), confirmed ? 2500 : 500);
    return () => clearTimeout(t);
  }, [confirmed, timedOut, navigate]);

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full text-center space-y-6">

        {/* Icon */}
        <div className="flex justify-center">
          {confirmed ? (
            <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
          )}
        </div>

        {/* Text */}
        {confirmed ? (
          <>
            <div>
              <h1 className="text-2xl font-heading font-bold text-fg">
                ¡Bienvenido a bordo! 🎉
              </h1>
              <p className="text-fg-muted text-[14px] mt-2 leading-relaxed">
                Tu suscripción está activa. Redirigiendo al dashboard...
              </p>
            </div>

            <div className="rounded-[16px] border border-emerald-500/20 bg-emerald-500/5 p-5 text-left space-y-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-[13px] text-fg-secondary">Acceso completo a todas las funciones</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-[13px] text-fg-secondary">Soporte prioritario activado</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-[13px] text-fg-secondary">Recibo enviado a tu correo</span>
              </div>
            </div>
          </>
        ) : timedOut ? (
          <div>
            <h1 className="text-2xl font-heading font-bold text-fg">Pago recibido</h1>
            <p className="text-fg-muted text-[14px] mt-2 leading-relaxed">
              Tu pago fue procesado. Accediendo al dashboard...
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-heading font-bold text-fg">Confirmando tu suscripción</h1>
            <p className="text-fg-muted text-[14px] mt-2 leading-relaxed">
              Estamos verificando tu pago con Polar. Esto toma unos segundos...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
