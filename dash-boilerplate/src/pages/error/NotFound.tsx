import { useNavigate } from "react-router";
import { SearchX, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#050505] overflow-hidden flex items-center justify-center p-4">
      {/* High-End Atmospheric Background similar to Pricing */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/10 via-white to-white dark:from-primary-950/10 dark:via-gray-950 dark:to-gray-950" />
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" 
          style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`, backgroundSize: '24px 24px' }} 
        />
        <div className="absolute top-[20%] right-[-10%] w-[80%] h-[80%] bg-primary-500/5 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-premium p-12 text-center border border-gray-100 dark:border-gray-800 backdrop-blur-sm">
          <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gray-100 dark:border-gray-800/50 shadow-inner">
            <SearchX className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          
          <div className="inline-block px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-extrabold text-xs uppercase tracking-widest mb-6 border border-gray-200 dark:border-gray-700">
            Error 404
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Página no encontrada
          </h1>
          
          <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed font-medium">
            La ruta a la que intentas acceder no existe o fue movida. Verifica la dirección web.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-4 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
              Regresar
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-500 text-white px-6 py-4 rounded-2xl font-bold hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 active:scale-95 border border-primary-400"
            >
              <Home className="w-5 h-5" />
              Ir al Inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
