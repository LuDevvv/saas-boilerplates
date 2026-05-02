import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Check } from "lucide-react";
import type { ForgotPasswordFormData } from "@/utils/validations/auth";
import { forgotPasswordSchema } from "@/utils/validations/auth";
import { Input, Button } from "@node-stack/ui";
import { useRequestPasswordReset } from "@/features/auth/hooks";
import { appToast } from "@/components/alerts/Toasts";
import { AuthSidebar } from "./components/AuthSidebar";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const { mutate: requestReset, isPending } = useRequestPasswordReset();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: async (data) => {
      try {
        const parsed = await forgotPasswordSchema.parseAsync(data);
        return { values: parsed, errors: {} };
      } catch (error: any) {
        if (error.errors) {
          const formErrors: any = {};
          error.errors.forEach((e: any) => {
             formErrors[e.path[0]] = { type: e.code, message: e.message };
          });
          return { values: {}, errors: formErrors };
        }
        return { values: {}, errors: {} };
      }
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setEmailValue(data.email);
    requestReset(data.email, {
      onSettled: () => {
        appToast.success({
          title: "Solicitud procesada",
          description: "Si el correo está registrado, recibirás las instrucciones en breve.",
        });
        setIsSubmitted(true);
      }
    });
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#0A0A0A] overflow-hidden">
      {/* Left side: Form */}
      <div className="flex w-full lg:w-1/2 flex-col p-8 lg:p-12 xl:p-16 h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center animate-slide-up-fade" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 mt-8 lg:mt-0">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <div className="w-5 h-5 bg-white rounded-sm transform rotate-45"></div>
            </div>
            <span className="text-xl font-heading tracking-tight text-gray-900 dark:text-white">NodeStack</span>
          </div>

          {!isSubmitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-heading text-gray-900 dark:text-white">
                  ¿Olvidaste tu contraseña?
                </h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
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
                  className="h-12 rounded-xl shadow-lg shadow-primary/25 text-base font-bold tracking-tight mt-2"
                >
                  Enviar instrucciones
                </Button>
              </form>

              <div className="mt-8 text-center text-sm">
                <p className="text-gray-500 dark:text-gray-400">
                  ¿Recuerdas tu contraseña?{" "}
                  <Link
                    to="/auth/sign-in"
                    className="font-bold text-primary-600 transition-colors duration-200 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Iniciar sesión
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Check className="size-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="mb-2 text-2xl font-heading text-gray-900 dark:text-white">
                Revisa tu correo
              </h2>
              <p className="mb-8 text-gray-500 dark:text-gray-400">
                Te hemos enviado un email con instrucciones a{" "}
                <span className="font-medium text-gray-900 dark:text-white">{emailValue}</span>.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => setIsSubmitted(false)}
                  fullWidth
                  className="h-12 rounded-xl text-base font-bold tracking-tight"
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
        <div className="mt-8 pb-8 lg:pb-0 text-[11px] font-medium text-gray-400 text-center">
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
