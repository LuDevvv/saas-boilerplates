import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Check, AlertTriangle } from "lucide-react";
import { appToast } from "@/components/alerts/Toasts";
import type { ResetPasswordFormData } from "@/utils/validations/auth";
import { resetPasswordSchema } from "@/utils/validations/auth";
import { Input, Button } from "@node-stack/ui";
import { useResetPassword } from "@/features/auth/hooks";
import { AuthSidebar } from "./components/AuthSidebar";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token: urlToken } = useParams();
  const queryToken = searchParams.get("token");
  const token = urlToken ?? queryToken;

  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: async (data) => {
      try {
        const parsed = await resetPasswordSchema.parseAsync(data);
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
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password") || "";
  const hasMinLength = passwordValue.length >= 6;
  const hasRegex = /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z])/.test(passwordValue);

  useEffect(() => {
    if (!token) {
      appToast.error({
        title: "Token inválido",
        description: "El enlace de recuperación ha expirado o es incorrecto."
      });
    }
  }, [token]);

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) return;

    resetPassword(
      { token, password: data.password },
      { 
        onSuccess: () => {
          appToast.success({
            title: "¡Éxito!",
            description: "Tu contraseña ha sido actualizada correctamente.",
          });
          setIsSuccess(true);
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message || "El enlace podría haber expirado. Solicita uno nuevo.";
          appToast.error({
            title: "Error de actualización",
            description: errorMessage,
          });
        }
      }
    );
  };

  if (!token) {
    return (
      <div className="flex h-screen bg-white dark:bg-[#0A0A0A] overflow-hidden">
        {/* Left side: Error */}
        <div className="flex w-full lg:w-1/2 flex-col p-8 lg:p-12 xl:p-16 h-full overflow-y-auto">
          <div className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center animate-slide-up-fade" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10 mt-8 lg:mt-0">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <div className="w-5 h-5 bg-white rounded-sm transform rotate-45"></div>
              </div>
              <span className="text-xl font-heading tracking-tight text-gray-900 dark:text-white">NodeStack</span>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                <AlertTriangle className="size-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="mb-2 text-2xl font-heading text-red-700 dark:text-red-400">
                Token inválido
              </h2>
              <p className="mb-8 text-gray-500 dark:text-gray-400">
                No se proporcionó un token válido o ha expirado. Solicita uno nuevo para restablecer tu contraseña.
              </p>
              <Button
                onClick={() => navigate("/auth/forgot-password")}
                fullWidth
                size="lg"
                className="h-12 rounded-xl text-base font-bold tracking-tight"
              >
                Solicitar nuevo enlace
              </Button>
            </div>
          </div>
          {/* Footer */}
          <div className="mt-8 pb-8 lg:pb-0 text-[11px] font-medium text-gray-400 text-center">
            2026 NodeStack, All rights Reserved
          </div>
        </div>

        <AuthSidebar 
          titleMain="Asegura tu" 
          titleAccent="cuenta" 
          subtitle="Solicita un nuevo enlace para acceder al panel." 
        />
      </div>
    );
  }

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

          {!isSuccess ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-heading text-gray-900 dark:text-white">
                  Restablece tu contraseña
                </h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Crea una nueva contraseña segura para tu cuenta.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    label="Nueva contraseña"
                    placeholder="Crea una contraseña"
                    className="h-12 rounded-xl"
                    error={errors.password?.message}
                    {...register("password")}
                    rightElement={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    }
                  />
                  
                  {/* Password Requirements UI */}
                  {passwordValue.length > 0 && (
                    <div className="mt-3 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 flex flex-col gap-2.5">
                      <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1">Tu contraseña debe incluir:</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${hasMinLength ? 'bg-success text-white' : 'bg-gray-200 dark:bg-white/10 text-transparent'}`}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <span className={`text-[13px] ${hasMinLength ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>Al menos 6 caracteres</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${hasRegex ? 'bg-success text-white' : 'bg-gray-200 dark:bg-white/10 text-transparent'}`}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <span className={`text-[13px] ${hasRegex ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>Mayúscula, minúscula y número</span>
                      </div>
                    </div>
                  )}
                </div>

                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirmar nueva contraseña"
                  placeholder="Confirma tu contraseña"
                  className="h-12 rounded-xl"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                  rightElement={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  }
                />

                <Button
                  type="submit"
                  loading={isPending}
                  fullWidth
                  size="lg"
                  className="h-12 rounded-xl shadow-lg shadow-primary/25 text-base font-bold tracking-tight mt-4"
                >
                  Actualizar contraseña
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
                ¡Contraseña actualizada!
              </h2>
              <p className="mb-8 text-gray-500 dark:text-gray-400">
                Tu contraseña ha sido actualizada correctamente. Puedes iniciar sesión con tus nuevas credenciales.
              </p>

              <Button
                onClick={() => navigate("/auth/sign-in")}
                fullWidth
                size="lg"
                className="h-12 rounded-xl text-base font-bold tracking-tight"
              >
                Ir al inicio de sesión
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pb-8 lg:pb-0 text-[11px] font-medium text-gray-400 text-center">
          2026 NodeStack, All rights Reserved
        </div>
      </div>

      <AuthSidebar 
        titleMain="Asegura tu" 
        titleAccent="cuenta" 
        subtitle="Crea una contraseña segura para volver al panel y continuar construyendo." 
      />
    </div>
  );
};

export default ResetPassword;
