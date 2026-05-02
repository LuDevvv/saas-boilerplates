import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
}

export const ErrorState = ({
  title = "Hubo un detalle",
  message = "No pudimos conectar con los servicios. Intenta de nuevo en un momento.",
  onRetry,
  icon,
}: ErrorStateProps) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 py-16">
      <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-premium p-12 max-w-md w-full text-center border border-gray-100 dark:border-gray-800 transition-all">
        <div className="w-20 h-20 bg-danger-50 dark:bg-danger-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-danger-100 dark:border-danger-500/20">
          {icon || <AlertCircle className="w-10 h-10 text-danger-500" />}
        </div>

        <h2 className="text-3xl lg:text-3xl font-heading text-gray-900 dark:text-white mb-4 ">
          {title}
        </h2>

        <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed font-label">          {message}
        </p>

        {onRetry && (
          <button
            className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white px-8 py-4 rounded-2xl font-heading hover:bg-primary-600 transition-all shadow-lg shadow-blue-900/20 active:scale-95 group border border-primary-400"
            onClick={onRetry}
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};
