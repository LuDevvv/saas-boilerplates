import { useNavigate } from "react-router";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@node-stack/ui";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6 select-none bg-canvas text-fg">
      {/* Cinematic Background Atmosphere */}
      <div className="absolute inset-0 z-0">
        {/* Soft brand glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        {/* Dotted grid — uses currentColor at low opacity, adapts to mode */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Large Minimalist Hero 404 — ghost watermark via fg gradient */}
        <div className="relative mb-4">
          <h1 className="text-[12rem] md:text-[18rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-fg to-fg-muted opacity-10 dark:opacity-20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-8 md:translate-y-12">
            <h2 className="text-3xl md:text-5xl font-black text-fg uppercase">
              Perdido en el <span className="text-primary">Vacio</span>
            </h2>
          </div>
        </div>

        <p className="text-fg-muted font-label uppercase text-[10px] tracking-wider mb-12">
          La página solicitada no pudo ser encontrada
        </p>

        {/* Minimalist Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-fg-muted hover:text-fg transition-colors font-label text-xs uppercase tracking-wider px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Regresar
          </button>

          <div className="w-px h-8 bg-border hidden sm:block" />

          <Button
            onClick={() => navigate("/")}
            className="h-14 px-10 rounded-full bg-primary hover:bg-primary-600 text-primary-foreground shadow-[0_12px_40px_-8px_rgba(0,64,128,0.40)] dark:shadow-[0_12px_40px_-8px_rgba(91,168,229,0.40)] transition-all font-heading uppercase text-[11px] active:scale-95"
          >
            <Home className="w-4 h-4 mr-2" />
            Panel de Control
          </Button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <div className="h-px w-8 bg-border" />
        <span className="text-[9px] font-label text-fg-disabled uppercase tracking-wider">
          Elora Systems v4.0
        </span>
        <div className="h-px w-8 bg-border" />
      </div>
    </div>
  );
};

export default NotFound;
