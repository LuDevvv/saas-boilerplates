import { zodResolver } from "@hookform/resolvers/zod";
import type { RegisterDto } from "@node-stack/types";
import { Input, Button, Checkbox, SocialButton } from "@node-stack/ui";
import { SignUpSchema, type SignUpDto } from "@node-stack/validators";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { AuthSidebar } from "./components/AuthSidebar";

import { Logo } from "@/assets/logo/logo";
import { appToast } from "@/components/alerts/Toasts";
import { useRegisterFlow } from "@/composables";
import { useAuthStore } from "@/stores/authStore";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(useShallow((state) => state.isAuthenticated));
  const { mutateAsync: registerUser, isPending, error: serverError } = useRegisterFlow();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors },
  } = useForm<SignUpDto>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(SignUpSchema as any),
    mode: "onChange",
    defaultValues: { acceptedTerms: true, firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
  });

  // Sync server errors with form fields and show toast
  useEffect(() => {
    if (serverError) {
      appToast.error(serverError);

      // Map common errors (e.g. duplicate email)
      const message = serverError.message || "";
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("email") || lowerMessage.includes("correo") || lowerMessage.includes("registrado")) {
        setError("email", { type: "server", message });
      }
    }
  }, [serverError, setError]);

  const passwordValue = watch("password") || "";
  const hasMinLength = passwordValue.length >= 6;
  const hasRegex = /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z])/.test(passwordValue);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: SignUpDto) => {
    const { confirmPassword: _confirmPassword, acceptedTerms: _acceptedTerms, ...registrationData } = data;
    try {
      await registerUser(registrationData as RegisterDto);
      // Navigation to /auth/verify-email is handled by useRegisterFlow onSuccess
    } catch {
      // Error handled in useEffect
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

          <div className="mb-8">
            <h1 className="text-3xl font-heading text-fg">
              Crea tu cuenta
            </h1>
            <p className="mt-2 text-fg-secondary">
              Comienza hoy mismo con NodeStack
            </p>
          </div>

          <div className="mb-4">
            <div className="flex w-full gap-3">
              <SocialButton
                provider="google"
                type="button"
                onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL ?? ""}/auth/google`; }}
                disabled={isPending}
                className="h-12 w-full border-border hover:bg-surface-hover"
              >
                Registrarse con Google
              </SocialButton>
            </div>

            <div className="my-8 flex items-center">
              <div className="grow border-t border-border"></div>
              <span className="mx-4 text-[10px] font-bold uppercase  text-fg-muted">
                O regístrate con correo
              </span>
              <div className="grow border-t border-border"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                id="firstName"
                type="text"
                label="Nombre(s)"
                placeholder="Juan"
                autoComplete="given-name"
                className="h-12 rounded-xl"
                error={errors.firstName?.message}
                {...register("firstName")}
              />

              <Input
                id="lastName"
                type="text"
                label="Apellidos"
                placeholder="Pérez"
                autoComplete="family-name"
                className="h-12 rounded-xl"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>

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

            <div className="space-y-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                label="Contraseña"
                placeholder="••••••••"
                autoComplete="new-password"
                className="h-12 rounded-xl"
                error={errors.password?.message}
                {...register("password")}
                rightElement={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-fg-muted hover:text-fg"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                }
              />

              {/* Password Requirements UI */}
              {passwordValue.length > 0 && (
                <div className="mt-3 p-4 bg-surface-muted rounded-xl border border-border flex flex-col gap-2.5">
                  <p className="text-[11px] font-bold text-fg-muted uppercase  mb-1">
                    Tu contraseña debe incluir:
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${hasMinLength ? 'bg-emerald-500 text-white' : 'bg-surface border border-border text-transparent'}`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className={`text-[13px] ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-fg-muted'}`}>Al menos 6 caracteres</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${hasRegex ? 'bg-emerald-500 text-white' : 'bg-surface border border-border text-transparent'}`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className={`text-[13px] ${hasRegex ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-fg-muted'}`}>Mayúscula, minúscula y número</span>
                  </div>
                </div>
              )}
            </div>

            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              label="Confirmar contraseña"
              placeholder="••••••••"
              autoComplete="new-password"
              className="h-12 rounded-xl"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
              rightElement={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-fg-muted hover:text-fg"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              }
            />

            <div className="py-2">
              <Controller
                name="acceptedTerms"
                control={control}
                render={({ field, fieldState }) => (
                  <Checkbox
                    id="acceptedTerms"
                    checked={!!field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    label="Acepto los términos y condiciones"
                  />
                )}
              />
            </div>

            <Button
              type="submit"
              loading={isPending}
              fullWidth
              size="lg"
              className="h-12 rounded-xl shadow-lg shadow-primary/25 text-base font-bold "
            >
              Registrarse
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-fg-secondary">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/auth/sign-in"
                className="font-bold text-primary hover:text-primary-600 transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pb-8 lg:pb-0 text-[11px] font-medium text-fg-muted text-center">
          2026 NodeStack, All rights Reserved
        </div>
      </div>

      <AuthSidebar
        titleMain="La forma más rápida de lanzar tu"
        titleAccent="producto digital"
        subtitle="Únete a miles de desarrolladores que confían en NodeStack para escalar sus aplicaciones."
      />
    </div>
  );
};

export default SignUpPage;
