import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Check } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ForgotPasswordFormData } from "@/utils/validations/auth";
import { forgotPasswordSchema } from "@/utils/validations/auth";
import { Input, Button } from "@node-stack/ui";
import { useRequestPasswordReset } from "@/features/auth/hooks";
import { appToast } from "@/components/alerts/Toasts";
import { AuthSidebar } from "./components/AuthSidebar";
import { Logo } from "@/assets/logo/logo";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const { mutateAsync: requestReset, isPending, error: serverError } = useRequestPasswordReset();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema as any),
    mode: "onChange",
  });

  // Sync server errors with form fields
  useEffect(() => {
    if (serverError) {
      // Intentar mapear error a campo email si es relevante
      if (serverError.message?.toLowerCase().includes("email")) {
        setError("email", { message: serverError.message });
      }
    }
  }, [serverError, setError]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setEmailValue(data.email);
    try {
      await requestReset(data.email);
      appToast.success({
        title: "Solicitud procesada",
        description: "Si el correo está registrado, recibirás las instrucciones en breve.",
      });
      setIsSubmitted(true);
    } catch (e) {
      // Error manejado en el useEffect
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {/* Left side: Form */}
      <div className="flex w-full lg:w-1/2 flex-col p-8 lg:p-12 xl:p-16 h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center animate-slide-up-fade" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          {/* Logo */}
          <Link to="/" className="mb-10 w-fit mt-8 lg:mt-0">
            <Logo variant="full" width={180} height={45} />
          </Link>

          {!isSubmitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-heading text-fg">
                  ¿Olvidaste tu contraseña?
                </h1>
                <p className="mt-2 text-fg-secondary">
                  No te preocupes, te enviaremos instrucciones para restablecerla.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  id="email"
                  type="email"
                  label="Correo electrónico"
                  placeholder="ejemplo@correo.com"
                  autoComplete="email"
                  className="h-12 rounded-xl"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Button
                  type="submit"
                  loading={isPending}
                  fullWidth
                  size="lg"
                  className="h-12 rounded-xl shadow-lg shadow-primary/25 text-base font-bold  mt-2"
                >
                  Enviar instrucciones
                </Button>
              </form>

              <div className="mt-8 text-center text-sm">
                <p className="text-fg-secondary">
                  ¿Recuerdas tu contraseña?{" "}
                  <Link
                    to="/auth/sign-in"
                    className="font-bold text-primary hover:text-primary-600 transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Check className="size-8 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h2 className="mb-2 text-2xl font-heading text-fg">
                Revisa tu correo
              </h2>
              <p className="mb-8 text-fg-secondary">
                Te hemos enviado un email con instrucciones a{" "}
                <span className="font-medium text-fg">{emailValue}</span>.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => setIsSubmitted(false)}
                  fullWidth
                  className="h-12 rounded-xl text-base font-bold "
                >
                  Reenviar instrucciones
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => navigate("/auth/sign-in")}
                  className="h-12 rounded-xl text-base font-medium"
                >
                  Volver al inicio de sesión
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pb-8 lg:pb-0 text-[11px] font-medium text-fg-muted text-center">
          2026 NodeStack, All rights Reserved
        </div>
      </div>

      <AuthSidebar
        titleMain="Recupera tu"
        titleAccent="acceso"
        subtitle="Ingresa tu correo para recibir un enlace seguro y continuar construyendo."
      />
    </div>
  );
};

export default ForgotPassword;
