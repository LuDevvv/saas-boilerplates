import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import type { SignUpFormData } from "@utils/validations/auth";
import { signupSchema } from "@utils/validations/auth";
import { Eye, EyeOff } from "lucide-react";
import { Input, Button, PhoneInput, Checkbox, SocialButton } from "@node-stack/ui";
import { useRegisterFlow } from "@/composables";
import { useAuthStore } from "@/stores/authStore";
import { useShallow } from "zustand/react/shallow";
import { AuthSidebar } from "./components/AuthSidebar";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(useShallow((state) => state.isAuthenticated));
  const { mutate: registerUser, isPending } = useRegisterFlow();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: async (data) => {
      try {
        const parsed = await signupSchema.parseAsync(data);
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
    defaultValues: { acceptedTerms: true, firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password") || "";
  const hasMinLength = passwordValue.length >= 6;
  const hasRegex = /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z])/.test(passwordValue);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data: SignUpFormData) => {
    const { confirmPassword: _confirmPassword, acceptedTerms: _acceptedTerms, ...registrationData } = data;
    registerUser(registrationData, {
      onSuccess: () => {
        navigate("/onboarding");
      },
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

          <div className="mb-8">
            <h1 className="text-3xl font-heading text-gray-900 dark:text-white">
              Crea tu cuenta
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Comienza hoy mismo con NodeStack
            </p>
          </div>

          <div className="mb-4">
            <div className="flex w-full gap-3">
              <SocialButton provider="google" disabled={isPending} className="h-12 w-full border-gray-200 shadow-sm hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5">
                Registrarse con Google
              </SocialButton>
            </div>

            <div className="my-8 flex items-center">
              <div className="grow border-t border-gray-100 dark:border-white/5"></div>
              <span className="mx-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                O REGÍSTRATE CON CORREO
              </span>
              <div className="grow border-t border-gray-100 dark:border-white/5"></div>
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
                  className="size-8 text-gray-400 hover:text-gray-600"
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
              className="h-12 rounded-xl shadow-lg shadow-primary/25 text-base font-bold tracking-tight"
            >
              Registrarse
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-gray-500">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/auth/sign-in"
                className="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pb-8 lg:pb-0 text-[11px] font-medium text-gray-400 text-center">
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
