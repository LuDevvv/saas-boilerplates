import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/stores/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginFormData } from "@utils/validations/auth";
import { loginSchema } from "@utils/validations/auth";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { appToast } from "@/components/alerts/Toasts";
import GoogleButton from "@/components/GoogleButton";
import { useAnalyticsEvent } from "@/hooks/analytics";
import { Input } from "@/components/ui/form/Input";
import { Checkbox } from "@/components/ui/form/Checkbox";
import { Button } from "@/components/ui/form/Button";
import { siteConfig } from "@/config/site-config";

const SignInPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, error, clearError, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { trackEvent, trackError } = useAnalyticsEvent();
  // const isDark = theme === "dark";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user?.isEmailVerified) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  // Efecto para sincronizar errores del store con react-hook-form
  useEffect(() => {
    if (error?.fieldErrors) {
      Object.entries(error.fieldErrors).forEach(([field, message]) => {
        if (field in loginSchema.shape) {
          setError(field as keyof LoginFormData, { message });
        }
      });
      clearError();
    }
  }, [error]);

  const onSubmit = async (data: LoginFormData) => {
    const toastId = appToast.loading({
        title: "Iniciando sesión",
        description: "Validando tus credenciales..."
    });
    try {
      const success = await login({
        ...data,
        rememberMe,
      });
      if (success) {
        appToast.dismiss(toastId);

        trackEvent("login", {
          event_category: "Authentication",
          event_label: "Email Login",
          user_id: user?.id,
        });
      } else if (error?.message) {
        appToast.error(
          {
            title: "Error de acceso",
            description: error.message
          },
          { id: toastId }
        );

        trackError("Login failed", error.message);
      } else {
        appToast.error(
          {
            title: "Error de acceso",
            description: "No se pudo iniciar sesión. Revisa tus datos."
          },
          { id: toastId }
        );
        trackError("Login failed", "Unknown error");
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

      trackError("Login error", errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center md:h-screen md:flex-row md:overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Left: Hero Image */}
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

      {/* Right: Login Form */}
      <div className="relative z-20 -mt-12 flex w-full items-center justify-center rounded-t-[30px] bg-white dark:bg-gray-950 px-6 py-12 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.3)] dark:shadow-none [-ms-overflow-style:'none'] [scrollbar-width:'none'] md:mt-0 md:block md:h-full md:w-1/2 md:overflow-y-auto md:rounded-none md:px-8 md:shadow-[-10px_0_60px_-15px_rgba(0,0,0,0.3)] dark:md:shadow-none lg:px-12 [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto w-full max-w-md md:flex md:min-h-full md:flex-col md:justify-center">
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center">
              <img src="/logo-light.png" alt={siteConfig.name} className="h-12 w-auto" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Bienvenido de nuevo
            </h1>
            <p className="mt-3 text-base text-gray-500">
              Accede a tu cuenta para continuar
            </p>
          </div>

          <div className="mb-6">
            <div className="space-y-3">
              <GoogleButton type="signin" disabled={isSubmitting} />
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

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label="Contraseña"
              icon={Lock}
              placeholder="••••••••"
              autoComplete="current-password"
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

            <div className="flex flex-wrap items-center justify-between gap-4">
              <Checkbox
                id="remember-me"
                name="remember-me"
                label="Mantener sesión iniciada"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />

              <Link
                to="/auth/forgot-password"
                className="text-sm font-medium text-[#7144F9] transition-colors duration-200 hover:text-[#6134e9] hover:underline dark:text-primary-400 dark:hover:text-primary-300"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
              fullWidth
              size="lg"
              className="py-4 shadow-[0_10px_30px_-10px_rgba(113,68,249,0.4)] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Iniciar sesión
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/auth/sign-up"
                className="font-medium text-[#7144F9] transition-colors duration-200 hover:text-[#6134e9] hover:underline dark:text-primary-400 dark:hover:text-primary-300"
              >
                Regístrate
              </Link>
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500">
            Al iniciar sesión, aceptas nuestros{" "}
            <Link to="/terms" className="text-[#7144F9] dark:text-primary-400 hover:underline">
              Términos y Condiciones
            </Link>{" "}
            y{" "}
            <Link to="/privacy" className="text-[#7144F9] dark:text-primary-400 hover:underline">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
