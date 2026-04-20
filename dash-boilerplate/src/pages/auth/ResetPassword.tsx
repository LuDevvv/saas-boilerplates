import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, Check, AlertTriangle } from "lucide-react";
import { appToast } from "@/components/alerts/Toasts";
import type { ResetPasswordFormData } from "@/utils/validations/auth";
import { resetPasswordSchema } from "@/utils/validations/auth";
import { useEffect } from "react";
import { useAuth } from "@/hooks/stores/useAuth";
import { ResetPasswordPreviewSection } from "@/components/auth/ResetPasswordPreviewSection";
import { Input } from "@/components/ui/form/Input";
import { Button } from "@/components/ui/form/Button";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token: urlToken } = useParams();
  const queryToken = searchParams.get("token");
  const token = urlToken ?? queryToken;

  const { resetPassword, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      appToast.error({
          title: "Token inválido",
          description: "El enlace de recuperación ha expirado o es incorrecto."
      });
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    const toastId = appToast.loading({
        title: "Actualizando",
        description: "Estableciendo tu nueva contraseña..."
    });
    try {
      const success = await resetPassword(token, data.password);

      if (success) {
        appToast.success(
          {
            title: "¡Éxito!",
            description: "Contraseña actualizada correctamente."
          },
          { id: toastId }
        );
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/auth/sign-in");
        }, 1000);
      } else {
        appToast.error(
          {
            title: "Error de actualización",
            description: "El enlace podría haber expirado. Solicita uno nuevo."
          },
          { id: toastId }
        );
      }
    } catch (error) {
      appToast.error(
        {
          title: "Error inesperado",
          description: "No pudimos procesar el cambio. Inténtalo de nuevo."
        },
        { id: toastId }
      );
    }
  };

  const handleReturnToLogin = () => {
    navigate("/auth/sign-in");
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors duration-500">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-xl dark:shadow-none backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
              <AlertTriangle className="size-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-red-700 dark:text-red-400">
              Token inválido
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              No se proporcionó un token válido para restablecer la contraseña.
              El enlace podría haber expirado o ser inválido.
            </p>
            <Button
              onClick={() => navigate("/auth/forgot-password")}
              fullWidth
              size="lg"
            >
              Solicitar nuevo enlace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col-reverse bg-gray-50 dark:bg-gray-950 lg:flex-row transition-colors duration-500">
      {/* Form Section - Bottom on mobile, Left on desktop */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:p-6 md:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-md py-4">
            <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-xl dark:shadow-none sm:p-8 backdrop-blur-sm">
              {!isSuccess ? (
                <>
                  <h2 className="mb-2 text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                    Restablece tu contraseña
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-400">
                    Crea una nueva contraseña segura para tu cuenta
                  </p>

                  <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        label="Nueva contraseña"
                        icon={Lock}
                        placeholder="Crea una contraseña"
                        error={errors.password?.message}
                        {...register("password")}
                        rightElement={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:ring-primary-500/50"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="size-5" />
                            ) : (
                              <Eye className="size-5" />
                            )}
                          </Button>
                        }
                      />

                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        label="Confirmar nueva contraseña"
                        icon={Lock}
                        placeholder="Confirma tu contraseña"
                        error={errors.confirmPassword?.message}
                        {...register("confirmPassword")}
                        rightElement={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:ring-primary-500/50"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="size-5" />
                            ) : (
                              <Eye className="size-5" />
                            )}
                          </Button>
                        }
                      />
                    </div>

                    <Button
                      type="submit"
                      loading={loading}
                      fullWidth
                      size="lg"
                      className="py-4 shadow-[0_10px_30px_-10px_rgba(113,68,249,0.4)] transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      Actualizar contraseña
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
                    ¡Contraseña actualizada!
                  </h2>
                  <p className="mb-6 text-gray-600 dark:text-gray-400">
                    Tu contraseña ha sido actualizada correctamente. Ahora
                    puedes iniciar sesión con tu nueva contraseña.
                  </p>

                  <Button
                    onClick={handleReturnToLogin}
                    fullWidth
                    size="lg"
                  >
                    Ir al inicio de sesión
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ResetPasswordPreviewSection />
    </div>
  );
};

export default ResetPassword;
