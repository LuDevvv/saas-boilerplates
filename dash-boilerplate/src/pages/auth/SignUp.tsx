import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/stores/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SignUpFormData } from "@utils/validations/auth";
import { signupSchema } from "@utils/validations/auth";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { appToast } from "@/components/alerts/Toasts";
import GoogleButton from "@/components/GoogleButton";
import { useAnalyticsEvent } from "@/hooks/analytics";
import { Input } from "@/components/ui/form/Input";
import { Button } from "@/components/ui/form/Button";
import { Controller } from "react-hook-form";
import { PhoneInput } from "@/components/ui/form/PhoneInput";
import { Checkbox } from "@/components/ui/form/Checkbox";
import { siteConfig } from "@/config/site-config";

const SignUpPage = () => {
  const {
    register: registerUser,
    error,
    clearError,
    pendingVerificationEmail,
    user,
  } = useAuth();
  const navigate = useNavigate();
  const { trackEvent, trackError } = useAnalyticsEvent();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      acceptedTerms: true,
    },
  });

  // Sincronizar errores del store con react-hook-form
  useEffect(() => {
    if (error?.fieldErrors) {
      Object.entries(error.fieldErrors).forEach(([field, message]) => {
        const validFields = [
          "name",
          "lastName",
          "email",
          "password",
          "confirmPassword",
        ];
        if (validFields.includes(field)) {
          setError(field as keyof SignUpFormData, { message });
        }
      });
      clearError();
    }
  }, [error]);

  // Redirigir a verificación si hay un email pendiente
  useEffect(() => {
    if (pendingVerificationEmail) {
      navigate(
        `/auth/verify-email?email=${encodeURIComponent(
          pendingVerificationEmail
        )}`
      );
    }
  }, [pendingVerificationEmail, navigate]);

  const onSubmit = async (data: SignUpFormData) => {
    const toastId = appToast.loading({
        title: "Creando cuenta",
        description: "Preparando tu espacio de trabajo..."
    });

    try {
      const { confirmPassword: _confirmPassword, ...registrationData } = data;
      const success = await registerUser(registrationData);

      if (success) {
        appToast.success(
          {
            title: "¡Bienvenido!",
            description: "Tu cuenta ha sido creada. Por favor, verifica tu email."
          },
          { id: toastId }
        );

        trackEvent("sign_up", {
          event_category: "Authentication",
          event_label: "Email Registration",
          user_id: user?.id,
        });
      } else if (error?.message) {
        appToast.error(
          {
            title: "Error de registro",
            description: error.message
          },
          { id: toastId }
        );

        trackError("Sign up failed", error.message);
      } else {
        appToast.error(
          {
            title: "Error de registro",
            description: "No pudimos completar tu registro en este momento."
          },
          { id: toastId }
        );
        trackError("Sign up failed", "Unknown error");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Error inesperado";
      appToast.error(
        {
          title: "Error de conexión",
          description: errorMessage
        },
        { id: toastId }
      );

      trackError("Sign up error", errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center md:h-screen md:flex-row-reverse md:overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Right: Hero Image */}
      <div className="relative block h-[50vh] w-full md:h-full md:w-1/2">
        <div className="absolute inset-0 z-0">
          <img
            src="/auth-hero.png"
            alt="Hero"
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply" />
        </div>
      </div>

      {/* Left: Sign Up Form */}
      <div className="relative z-20 -mt-12 flex w-full items-center justify-center rounded-t-[30px] bg-white dark:bg-gray-950 px-6 py-12 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.3)] dark:shadow-none [-ms-overflow-style:'none'] [scrollbar-width:'none'] md:mt-0 md:block md:h-full md:w-1/2 md:overflow-y-auto md:rounded-none md:px-8 md:shadow-[10px_0_60px_-15px_rgba(0,0,0,0.3)] dark:md:shadow-none lg:px-12 [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto w-full max-w-md md:flex md:min-h-full md:flex-col md:justify-center">
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center">
              <img src="/logo-light.png" alt={siteConfig.name} className="h-12 w-auto" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Crea tu cuenta
            </h1>
            <p className="mt-3 text-base text-gray-500">
              Comienza tu prueba gratuita hoy mismo
            </p>
          </div>

          <div className="mb-6">
            <div className="space-y-3">
              <GoogleButton type="signup" disabled={isSubmitting} />
            </div>

            <div className="my-6 flex items-center">
              <div className="grow border-t border-gray-200 dark:border-white/10"></div>
              <span className="mx-4 text-sm text-gray-500 dark:text-gray-400">
                o continúa con tu correo
              </span>
              <div className="grow border-t border-gray-200 dark:border-white/10"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                id="name"
                type="text"
                label="Nombre(s)"
                icon={User}
                placeholder="Juan"
                autoComplete="given-name"
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                id="lastName"
                type="text"
                label="Apellidos"
                icon={User}
                placeholder="Pérez"
                autoComplete="family-name"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>

            <Input
              id="email"
              type="email"
              label="Correo electrónico"
              icon={Mail}
              placeholder="ejemplo@correo.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <PhoneInput
                  label="Teléfono"
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label="Contraseña"
              icon={Lock}
              placeholder="••••••••"
              autoComplete="new-password"
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
                    <EyeOff className="size-5" aria-hidden="true" />
                  ) : (
                    <Eye className="size-5" aria-hidden="true" />
                  )}
                </Button>
              }
            />

            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              label="Confirmar contraseña"
              icon={Lock}
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
              rightElement={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:ring-primary-500/50"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-5" aria-hidden="true" />
                  ) : (
                    <Eye className="size-5" aria-hidden="true" />
                  )}
                </Button>
              }
            />

            <Controller
              name="acceptedTerms"
              control={control}
              render={({ field, fieldState }) => (
                <Checkbox
                  id="acceptedTerms"
                  checked={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  label="Acepto los términos y condiciones"
                  helperText={
                    <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                      Al registrarte, declaras que has leído y aceptas nuestros{" "}
                      <Link
                        to="/terms"
                        className="font-medium text-[#7144F9] hover:underline dark:text-primary-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Términos y Condiciones
                      </Link>{" "}
                      y{" "}
                      <Link
                        to="/privacy"
                        className="font-medium text-[#7144F9] hover:underline dark:text-primary-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Política de Privacidad
                      </Link>
                      .
                    </span>
                  }
                />
              )}
            />

            <Button
              type="submit"
              loading={isSubmitting}
              fullWidth
              size="lg"
              className="py-4 shadow-[0_10px_30px_-10px_rgba(113,68,249,0.4)] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Registrarse
            </Button>
          </form>

          <div className="mb-6"></div>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/auth/sign-in"
                className="font-medium text-[#7144F9] transition-colors duration-200 hover:text-[#6134e9] hover:underline dark:text-primary-400 dark:hover:text-primary-300"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
