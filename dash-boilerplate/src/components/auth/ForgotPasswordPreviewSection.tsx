import type { FC } from "react";
import { ShieldCheck, Check } from "lucide-react";

export const ForgotPasswordPreviewSection: FC = () => {
  return (
    <div className="relative w-full overflow-hidden bg-[#7144F9] dark:bg-gray-950 lg:min-h-screen lg:w-1/2">
      <div className="absolute inset-0 bg-gradient-to-br from-[#7144F9] via-[#7144F9] to-[#7573FB] dark:from-gray-950 dark:via-gray-950 dark:to-[#7144F9]/20"></div>

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Overlay content */}
      <div className="relative flex min-h-[400px] items-center justify-center p-8 sm:p-12 lg:absolute lg:inset-0 lg:min-h-0 lg:p-12">
        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-500 hover:scale-[1.01] sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-8 flex size-20 rotate-3 items-center justify-center rounded-2xl border border-white/30 bg-white/20 shadow-inner backdrop-blur-md transition-transform hover:rotate-6">
              <ShieldCheck className="size-10 -rotate-3 text-white" />
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white">
              Recuperación de cuenta segura
            </h2>

            <div className="w-full rounded-2xl border border-white/10 bg-black/5 p-6 shadow-inner backdrop-blur-md">
              <p className="mb-6 text-base leading-relaxed text-white/90 md:text-lg">
                Te enviaremos instrucciones para restablecer tu contraseña de
                forma segura y recuperar el acceso a tu cuenta.
              </p>

              <ul className="space-y-4 text-left">
                {[
                  "Verifica tu bandeja de entrada",
                  "Crea una contraseña segura",
                  "El enlace expira en 24 horas",
                ].map((text, idx) => (
                  <li
                    key={idx}
                    className="group flex cursor-default items-start gap-3 text-white"
                  >
                    <span className="mt-0.5 shrink-0">
                      <div className="flex size-6 items-center justify-center rounded-full bg-[#06D3BE] shadow-md transition-transform group-hover:scale-110">
                        <Check className="size-4 text-white" strokeWidth={3} />
                      </div>
                    </span>
                    <span className="font-medium text-white/90 transition-colors group-hover:text-white">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
