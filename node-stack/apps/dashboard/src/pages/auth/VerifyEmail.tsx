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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          icon={ArrowLeft}
          className="mb-6 text-gray-500 hover:text-gray-900 font-medium"
        >
          Cerrar sesión y volver
        </Button>

        <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-purple-100">
              <Mail className="size-8 text-[#7144F9]" />
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Verifica tu email
            </h2>
            <p className="text-sm text-gray-600">
              Hemos enviado un código de 6 dígitos a
            </p>
            <p className="font-semibold text-gray-900">{email}</p>
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
                <p className="text-sm text-gray-600">
                  Podrás reenviar el código en:{" "}
                  <span className="font-mono font-semibold text-gray-900">
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

          <div className="space-y-2 text-center">
            <p className="text-sm text-gray-600">¿No recibiste el código?</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={loading || !canResend}
              className="text-[#7144F9] hover:text-[#6134e9] font-bold"
            >
              {canResend ? "Reenviar código" : "Espera para reenviar"}
            </Button>
          </div>

          <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
            <p className="text-xs text-[#7144F9]">
              <strong>💡 Consejo:</strong> Revisa tu carpeta de spam si no ves
              el correo. El código expira en 15 minutos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
