/**
 * PaymentSuccess — landing page after Polar checkout redirect.
 *
 * Calls POST /billing/subscription/refresh on each poll attempt so it
 * actively syncs from Polar instead of reading potentially-stale cached data.
 * Once the subscription is confirmed active the user is sent to the dashboard.
 */

import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "@/lib/api";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { useWorkspaceStore } from "@/stores/workspaceStore";

const MAX_POLLS = 20;  // 20 × 3 s = 60 s max wait
const POLL_MS   = 3000;

const PaymentSuccess: React.FC = () => {
  const navigate      = useNavigate();
  const queryClient   = useQueryClient();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  const [polls, setPolls]         = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [timedOut, setTimedOut]   = useState(false);

  useEffect(() => {
    if (confirmed || timedOut) return;
    if (polls >= MAX_POLLS) {
      // Refresh user profile even on timeout — the subscription might still be
      // valid; we let the user in and let ProtectedRoute sort it out.
      void queryClient.refetchQueries({ queryKey: queryKeys.user.profile() });
      setTimedOut(true);
      return;
    }

    const id = setTimeout(async () => {
      try {
        // Use POST refresh (not GET) — this actively syncs from Polar's API
        // instead of reading Redis-cached data, which may be stale.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = await api.billing.refreshSubscription() as any;
        const status = sub?.status as string | undefined;
        if (status === "active" || status === "trialing") {
          // Re-fetch user profile so onboardingStatus is up-to-date before
          // ProtectedRoute evaluates it at the dashboard redirect.
          await queryClient.refetchQueries({ queryKey: queryKeys.user.profile() });
          setConfirmed(true);
          return;
        }
      } catch {
        // keep polling — network hiccup or server restart
      }
      setPolls((p) => p + 1);
    }, POLL_MS);

    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polls, confirmed, timedOut, activeWorkspaceId, queryClient]);

  // Navigate to dashboard once confirmed (or timed out — let the user in anyway)
  useEffect(() => {
    if (!confirmed && !timedOut) return;
    const t = setTimeout(() => navigate("/", { replace: true }), confirmed ? 2500 : 500);
    return () => clearTimeout(t);
  }, [confirmed, timedOut, navigate]);

  const progress = Math.min(100, Math.round((polls / MAX_POLLS) * 100));

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full text-center space-y-8">

        {/* Icon */}
        <div className="flex justify-center">
          {confirmed ? (
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/30 animate-in zoom-in duration-500">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            </div>
          ) : timedOut ? (
            <div className="h-24 w-24 rounded-full bg-amber-500/10 flex items-center justify-center border-2 border-amber-500/30">
              <XCircle className="h-12 w-12 text-amber-500" />
            </div>
          ) : (
            <div className="relative h-24 w-24">
              {/* Spinning ring */}
              <svg className="absolute inset-0 h-24 w-24 -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48" cy="48" r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-border"
                />
                <circle
                  cx="48" cy="48" r="44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                  className="text-primary transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Text */}
        {confirmed ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
              <h1 className="text-3xl font-heading font-bold text-fg">
                ¡Suscripción activa!
              </h1>
              <p className="text-fg-muted text-[14px] mt-2 leading-relaxed">
                Tu plan está listo. Accediendo al dashboard...
              </p>
            </div>

            <div className="rounded-[16px] border border-emerald-500/20 bg-emerald-500/5 p-5 text-left space-y-3">
              {[
                "Acceso completo a todas las funciones",
                "Soporte prioritario activado",
                "Recibo enviado a tu correo",
              ].map(item => (
                <div key={item} className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-[13px] text-fg-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ) : timedOut ? (
          <div className="space-y-3">
            <h1 className="text-2xl font-heading font-bold text-fg">Pago recibido</h1>
            <p className="text-fg-muted text-[14px] leading-relaxed">
              Tu pago fue procesado correctamente. Estamos finalizando la activación —
              accediendo al dashboard ahora.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-heading font-bold text-fg">
                Activando tu suscripción
              </h1>
              <p className="text-fg-muted text-[14px] mt-2 leading-relaxed">
                Verificando el pago con Polar y configurando tu cuenta.
                {polls > 3 && " Esto puede tomar unos segundos más..."}
              </p>
            </div>

            {/* Step indicators */}
            <div className="flex flex-col gap-2 text-left mt-2">
              {[
                { label: "Pago procesado por Polar", done: true },
                { label: "Sincronizando suscripción", done: polls > 0 },
                { label: "Configurando tu cuenta", done: confirmed },
              ].map(({ label, done }, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 border transition-colors duration-300 ${
                    done
                      ? "bg-primary/10 border-primary/30"
                      : "bg-surface-muted border-border"
                  }`}>
                    {done
                      ? <CheckCircle2 className="h-3 w-3 text-primary" />
                      : <div className="h-2 w-2 rounded-full bg-border" />
                    }
                  </div>
                  <span className={`text-[13px] transition-colors duration-300 ${done ? "text-fg" : "text-fg-muted"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
