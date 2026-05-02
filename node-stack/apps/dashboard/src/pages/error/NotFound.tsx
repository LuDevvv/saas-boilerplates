import { useNavigate } from "react-router";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@node-stack/ui";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0A0A0A] overflow-hidden flex flex-col items-center justify-center p-6 select-none">
      {/* Cinematic Background Atmosphere */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]" 
          style={{ backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }} 
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Large Minimalist Hero 404 */}
        <div className="relative mb-4">
          <h1 className="text-[12rem] md:text-[18rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-200 dark:from-white dark:to-white/5 opacity-10 dark:opacity-20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-8 md:translate-y-12">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
              Perdido en el <span className="text-primary">Vacio</span>
            </h2>
          </div>
        </div>

        <p className="text-gray-400 dark:text-gray-500 font-label uppercase tracking-[0.3em] text-[10px] mb-12">
          La página solicitada no pudo ser encontrada
        </p>

        {/* Minimalist Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all font-label text-xs uppercase tracking-widest px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Regresar
          </button>
          
          <div className="w-px h-8 bg-gray-200 dark:bg-white/10 hidden sm:block" />

          <Button
            onClick={() => navigate("/")}
            className="h-14 px-10 rounded-full bg-primary text-white hover:bg-primary-600 shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all font-heading uppercase text-[11px] tracking-widest active:scale-95"
          >
            <Home className="w-4 h-4 mr-2" />
            Panel de Control
          </Button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <div className="h-px w-8 bg-gray-200 dark:bg-white/10" />
        <span className="text-[9px] font-label text-gray-300 dark:text-gray-600 uppercase tracking-[0.4em]">
          Elora Systems v4.0
        </span>
        <div className="h-px w-8 bg-gray-200 dark:bg-white/10" />
      </div>
    </div>
  );
};

export default NotFound;
