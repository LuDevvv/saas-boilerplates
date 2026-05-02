import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { OTPInput, Button } from "@node-stack/ui";
import { appToast } from "@/components/alerts/Toasts";
import { useAuth } from "@/hooks/stores/useAuth";
import { useVerifyEmail, useResendVerification } from "@/features/auth/hooks";
import { AuthSidebar } from "./components/AuthSidebar";

const VerifyEmail: React.FC = () => {
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email") || "";

  const { mutate: verifyEmail, isPending: loading } = useVerifyEmail();
  const { mutate: resendCode } = useResendVerification();

  useEffect(() => {
    if (!email) {
      navigate("/auth/sign-in");
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6).split("");
    const newCode = [...code];
    pasteData.forEach((char, i) => {
      newCode[i] = char;
      if (inputRefs.current[i]) {
        inputRefs.current[i]!.value = char;
      }
    });
    setCode(newCode);
    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) return;

    verifyEmail(
      { email, code: fullCode },
      {
        onSuccess: () => {
          appToast.success({
            title: "¡Email verificado!",
            description: "Tu cuenta ha sido activada correctamente.",
          });
          navigate("/auth/sign-in");
        },
        onError: (error: any) => {
          appToast.error({
            title: "Error de verificación",
            description: error.response?.data?.message || "El código es incorrecto o ha expirado.",
          });
        }
      }
    );
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    resendCode(email, {
      onSuccess: () => {
        appToast.success({
          title: "Código enviado",
          description: "Revisa tu bandeja de entrada.",
        });
        setResendCooldown(60);
      },
      onError: (error: any) => {
        appToast.error({
          title: "Error al reenviar",
          description: error.response?.data?.message || "Inténtalo de nuevo más tarde.",
        });
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#0A0A0A] overflow-hidden">
      {/* Left side: Form */}
      <div className="flex w-full lg:w-1/2 flex-col p-8 lg:p-12 xl:p-16 h-full overflow-y-auto relative">
        <div className="absolute top-8 left-8 lg:top-12 lg:left-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            icon={ArrowLeft}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium"
          >
            Volver al inicio
          </Button>
        </div>

        <div className="mx-auto w-full max-w-md flex-1 flex flex-col justify-center animate-slide-up-fade" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 mt-16 lg:mt-0">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <div className="w-5 h-5 bg-white rounded-sm transform rotate-45"></div>
            </div>
            <span className="text-xl font-heading tracking-tight text-gray-900 dark:text-white">NodeStack</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-heading text-gray-900 dark:text-white">
              Verifica tu email
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Hemos enviado un código de 6 dígitos a <span className="font-medium text-gray-900 dark:text-white">{email}</span>
            </p>
          </div>

          <div className="space-y-8">
            <OTPInput
              length={6}
              code={code}
              inputRefs={inputRefs}
              disabled={loading}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
            />

            <div className="h-5 text-center">
              {resendCooldown > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Podrás reenviar el código en:{" "}
                  <span className="font-mono font-bold text-gray-900 dark:text-primary-400">
                    {formatTime(resendCooldown)}
                  </span>
                </p>
              )}
            </div>

            <Button
              onClick={handleVerify}
              loading={loading}
              disabled={code.some((d) => d === "")}
              fullWidth
              size="lg"
              className="h-12 rounded-xl shadow-lg shadow-primary/25 text-base font-bold tracking-tight mt-4"
            >
              Verificar código
            </Button>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-500 dark:text-gray-400">¿No recibiste el código?</p>
              <button
                onClick={handleResend}
                disabled={loading || resendCooldown > 0}
                className="mt-1 font-bold text-primary-600 transition-colors duration-200 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? "Espera para reenviar" : "Reenviar código"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pb-8 lg:pb-0 text-[11px] font-medium text-gray-400 text-center">
          2026 NodeStack, All rights Reserved
        </div>
      </div>

      <AuthSidebar 
        titleMain="Verifica tu" 
        titleAccent="identidad" 
        subtitle="Ingresa el código que enviamos a tu correo para activar tu cuenta y acceder al panel." 
      />
    </div>
  );
};

export default VerifyEmail;
