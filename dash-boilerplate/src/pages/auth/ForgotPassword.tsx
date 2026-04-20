import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Check } from "lucide-react";
import { appToast } from "@/components/alerts/Toasts";
import type { ForgotPasswordFormData } from "@/utils/validations/auth";
import { forgotPasswordSchema } from "@/utils/validations/auth";
import { useAuth } from "@/hooks/stores/useAuth";
import { ForgotPasswordPreviewSection } from "@/components/auth/ForgotPasswordPreviewSection";
import { Input } from "@/components/ui/form/Input";
import { Button } from "@/components/ui/form/Button";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const { requestPasswordReset } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const toastId = appToast.loading({
        title: "Enviando",
        description: "Procesando solicitud de recuperación..."
    });
    try {
      setEmailValue(data.email);
      const success = await requestPasswordReset(data.email);

      if (success) {
        appToast.success(
          {
            title: "Correo enviado",
            description: "Revisa tu bandeja de entrada para continuar."
          },
          { id: toastId }
        );
        setIsSubmitted(true);
      } else {
        // Para mantener la seguridad, siempre mostramos un mensaje genérico
        appToast.success(
          {
            title: "Solicitud procesada",
            description: "Si el correo está registrado, recibirás las instrucciones en breve."
          },
          { id: toastId }
        );
        setIsSubmitted(true);
      }
    } catch (err) {
      // Para mantener la seguridad, siempre mostramos un mensaje genérico
      appToast.success(
        {
          title: "Solicitud procesada",
          description: "Si el correo está registrado, recibirás las instrucciones en breve."
        },
        { id: toastId }
      );
      setIsSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-screen flex-col-reverse bg-gray-50 dark:bg-gray-950 lg:flex-row transition-colors duration-500">
      {/* Form Section - Bottom on mobile, Left on desktop */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:p-6 md:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-md py-4">
            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-xl dark:shadow-none sm:p-8 backdrop-blur-sm">
              {!isSubmitted ? (
                <>
                  <h2 className="mb-2 text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                    ¿Olvidaste tu contraseña?
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-400">
                    No te preocupes, te enviaremos instrucciones para
                    restablecerla
                  </p>

                  <form
                    id="forgot-password-form"
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    <div className="mb-6">
                      <Input
                        id="email"
                        type="email"
                        label="Correo electrónico"
                        icon={Mail}
                        placeholder="Ingresa tu correo electrónico"
                        autoComplete="email"
                        error={errors.email?.message}
                        {...register("email")}
                      />
                    </div>

                    <Button
                      type="submit"
                      loading={isSubmitting}
                      fullWidth
                      size="lg"
                      className="py-4 shadow-[0_10px_30px_-10px_rgba(113,68,249,0.4)] transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      Enviar instrucciones
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ¿Recuerdas tu contraseña?{" "}
                      <Link
                        to="/auth/sign-in"
                        className="font-medium text-[#7144F9] transition-colors duration-200 hover:text-[#6134e9] hover:underline dark:text-primary-400 dark:hover:text-primary-300"
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
                  <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                    Revisa tu correo
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-400">
                    Te hemos enviado un email con instrucciones para restablecer
                    tu contraseña a{" "}
                    <span className="font-medium text-gray-900 dark:text-white">{emailValue}</span>.
                  </p>
                  <p className="mb-6 text-sm text-gray-500 dark:text-gray-500">
                    Si no recibes el correo dentro de unos minutos, revisa tu
                    carpeta de spam o solicita un nuevo enlace.
                  </p>

                  <div className="mt-6 space-y-3">
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      fullWidth
                    >
                      Reenviar instrucciones
                    </Button>
                    <Button
                      variant="ghost"
                      fullWidth
                      className="border-2 border-gray-100 dark:border-white/10 font-bold text-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                      onClick={() => navigate("/auth/sign-in")}
                    >
                      Volver al inicio de sesión
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordPreviewSection />
    </div>
  );
};

export default ForgotPassword;
