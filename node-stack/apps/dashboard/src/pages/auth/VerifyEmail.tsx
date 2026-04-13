import { Mail, ArrowLeft } from "lucide-react";
import { useVerifyEmail } from "@/hooks/useVerifyEmail";
import { OTPInput } from "@/components/ui/form/OTPInput";
import { Button } from "@/components/ui/form/Button";

export const VerifyEmail: React.FC = () => {
  const {
    code,
    email,
    loading,
    resendCooldown,
    canResend,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleVerify,
    handleResend,
    handleLogout,
    formatTime,
  } = useVerifyEmail();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors duration-500">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          icon={ArrowLeft}
          className="mb-6 text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium"
        >
          Cerrar sesión y volver
        </Button>

        <div className="space-y-6 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 p-6 md:p-8 shadow-xl dark:shadow-none backdrop-blur-sm">
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-purple-100 dark:bg-primary-500/10 transition-colors duration-300">
              <Mail className="size-8 text-[#7144F9] dark:text-primary-400" />
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Verifica tu email
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hemos enviado un código de 6 dígitos a
            </p>
            <p className="font-semibold text-gray-900 dark:text-gray-200">{email}</p>
          </div>

          {/* Code Input */}
          <div className="space-y-4">
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
              {!canResend && resendCooldown > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Podrás reenviar el código en:{" "}
                  <span className="font-mono font-semibold text-gray-900 dark:text-primary-400">
                    {formatTime(resendCooldown)}
                  </span>
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={() => handleVerify()}
            loading={loading}
            disabled={code.some((d) => d === "")}
            fullWidth
            size="lg"
            className="py-4 shadow-[0_10px_30px_-10px_rgba(113,68,249,0.4)] transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Verificar código
          </Button>

          <div className="space-y-2 text-center border-t border-gray-100 dark:border-white/5 pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">¿No recibiste el código?</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={loading || !canResend}
              className="text-[#7144F9] hover:text-[#6134e9] font-bold dark:text-primary-400 dark:hover:text-primary-300"
            >
              {canResend ? "Reenviar código" : "Espera para reenviar"}
            </Button>
          </div>

          <div className="rounded-xl border border-purple-100 dark:border-primary-500/20 bg-purple-50 dark:bg-primary-500/5 p-4 transition-all duration-300">
            <p className="text-xs text-[#7144F9] dark:text-primary-400 leading-relaxed">
              <strong className="font-bold">💡 Consejo:</strong> Revisa tu carpeta de spam si no ves
              el correo. El código expira en 15 minutos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
