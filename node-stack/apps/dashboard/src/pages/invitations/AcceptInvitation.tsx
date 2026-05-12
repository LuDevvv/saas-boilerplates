/**
 * AcceptInvitation — public page linked from invitation emails.
 *
 * Flow for unauthenticated users:
 *   - "Iniciar sesión" → /auth/sign-in → returns here after login
 *   - "Crear cuenta"   → /auth/sign-up → returns here after registration + verification
 *
 * The token is persisted in sessionStorage ("pending_invitation") so it survives
 * the full auth cycle (sign-up → email verification → redirect back).
 *
 * Flow for authenticated users:
 *   - Shows workspace details + "Aceptar invitación" button
 *   - On accept: user is added to the workspace and onboardingStatus is set to "completed"
 *     (so they bypass the workspace-creation onboarding they don't need)
 */

import { CheckCircle2, Loader2, Users, XCircle, LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "@/lib/api";
import { useAuth } from "@/hooks/stores/useAuth";

const PENDING_KEY = "pending_invitation";

interface InvitationDetails {
  workspaceName: string;
  inviterName?: string;
  role: string;
  expiresAt: string;
}

type PageState = "loading" | "details" | "accepting" | "accepted" | "error";

const ROLE_LABEL: Record<string, string> = {
  owner:  "Propietario",
  admin:  "Administrador",
  member: "Miembro",
  guest:  "Invitado",
};

const AcceptInvitation: React.FC = () => {
  const { token }   = useParams<{ token: string }>();
  const navigate    = useNavigate();
  const { isAuthenticated } = useAuth();

  const [state, setState]     = useState<PageState>("loading");
  const [details, setDetails] = useState<InvitationDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Persist token so auth flow can return here after sign-up / sign-in
  useEffect(() => {
    if (token) sessionStorage.setItem(PENDING_KEY, token);
  }, [token]);

  // Fetch invitation details (public endpoint)
  useEffect(() => {
    if (!token) { setState("error"); setErrorMsg("Token de invitación inválido."); return; }

    api.workspace.getInvitationDetails(token)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((data: any) => {
        setDetails({
          workspaceName: data.workspaceName ?? "tu equipo",
          inviterName:   data.inviterName,
          role:          data.role ?? "member",
          expiresAt:     data.expiresAt
            ? new Date(data.expiresAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
            : "",
        });
        setState("details");
      })
      .catch((err: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msg = (err as any)?.message ?? "";
        if (msg.includes("expired") || msg.includes("expirada")) {
          setErrorMsg("Esta invitación ha expirado.");
        } else if (msg.includes("Invalid") || msg.includes("inválid")) {
          setErrorMsg("Esta invitación no existe o ya fue usada.");
        } else {
          setErrorMsg("No pudimos cargar la invitación. Intenta de nuevo.");
        }
        setState("error");
      });
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setState("accepting");
    try {
      await api.workspace.acceptInvitation(token);
      sessionStorage.removeItem(PENDING_KEY);
      setState("accepted");
      // Give the query cache time to invalidate before navigating
      setTimeout(() => navigate("/", { replace: true }), 2000);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.message ?? "No se pudo aceptar la invitación.";
      setErrorMsg(msg.includes("Already") ? "Ya eres miembro de este workspace." : msg);
      setState("error");
    }
  };

  const goSignIn  = () => navigate("/auth/sign-in",  { state: { from: { pathname: `/invitations/${token}` } } });
  const goSignUp  = () => navigate("/auth/sign-up",  { state: { from: { pathname: `/invitations/${token}` } } });

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center animate-in fade-in duration-500">

        {/* ── Loading ───────────────────────────────────────────────────── */}
        {state === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Loader2 className="h-7 w-7 text-primary animate-spin" />
            </div>
            <p className="text-fg-muted text-[14px]">Cargando invitación…</p>
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {state === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <XCircle className="h-7 w-7 text-red-500" />
            </div>
            <h1 className="text-[20px] font-heading font-bold text-fg">Invitación no válida</h1>
            <p className="text-fg-muted text-[14px] leading-relaxed">{errorMsg}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-1 px-5 py-2.5 rounded-xl border border-border text-[13px] font-medium text-fg hover:bg-surface-hover transition-colors"
            >
              Ir al dashboard
            </button>
          </div>
        )}

        {/* ── Accepted ─────────────────────────────────────────────────── */}
        {state === "accepted" && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <h1 className="text-[20px] font-heading font-bold text-fg">¡Te uniste al equipo!</h1>
            <p className="text-fg-muted text-[14px]">Redirigiendo al dashboard…</p>
          </div>
        )}

        {/* ── Details ──────────────────────────────────────────────────── */}
        {(state === "details" || state === "accepting") && details && (
          <div className="flex flex-col items-center gap-5">

            {/* Icon */}
            <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Users className="h-7 w-7 text-primary" />
            </div>

            {/* Invitation card */}
            <div className="w-full rounded-[20px] border border-border bg-surface p-5 text-left space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">
                Invitación de equipo
              </p>
              <h1 className="text-[22px] font-heading font-bold text-fg leading-tight">
                {details.workspaceName}
              </h1>
              {details.inviterName && (
                <p className="text-[13px] text-fg-muted leading-relaxed">
                  <strong className="text-fg">{details.inviterName}</strong> te invitó como{" "}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold">
                    {ROLE_LABEL[details.role] ?? details.role}
                  </span>
                </p>
              )}
              {details.expiresAt && (
                <p className="text-[11px] text-fg-muted">Expira el {details.expiresAt}</p>
              )}
            </div>

            {/* Actions */}
            {isAuthenticated ? (
              /* Authenticated: accept directly */
              <button
                onClick={handleAccept}
                disabled={state === "accepting"}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-[14px] hover:bg-primary-600 active:scale-[0.98] transition-all disabled:opacity-70"
              >
                {state === "accepting" ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Aceptando…</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> Aceptar invitación</>
                )}
              </button>
            ) : (
              /* Unauthenticated: two clear paths */
              <div className="w-full space-y-3">
                <p className="text-[13px] text-fg-muted leading-relaxed">
                  Para unirte a <strong className="text-fg">{details.workspaceName}</strong> necesitas
                  iniciar sesión o crear una cuenta con el correo al que llegó la invitación.
                </p>

                {/* Primary: sign in */}
                <button
                  onClick={goSignIn}
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-[14px] hover:bg-primary-600 active:scale-[0.98] transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión para aceptar
                </button>

                {/* Secondary: sign up */}
                <button
                  onClick={goSignUp}
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-border bg-surface text-fg font-semibold text-[14px] hover:bg-surface-hover active:scale-[0.98] transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  Crear cuenta nueva
                </button>

                <p className="text-[11px] text-fg-muted pt-1">
                  Si creas una cuenta nueva, usa el mismo correo al que llegó esta invitación.
                  Verifica tu correo y regresa aquí para completar el proceso.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AcceptInvitation;
