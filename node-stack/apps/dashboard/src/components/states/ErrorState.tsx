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
      <div className="bg-surface border border-border rounded-[20px] shadow-[var(--shadow-card)] p-12 max-w-md w-full text-center transition-all">
        <div className="w-20 h-20 bg-danger/10 border border-danger/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
          {icon || <AlertCircle className="w-10 h-10 text-danger" />}
        </div>

        <h2 className="text-3xl font-heading text-fg mb-4">
          {title}
        </h2>

        <p className="text-fg-secondary mb-10 leading-relaxed font-label">
          {message}
        </p>

        {onRetry && (
          <button
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-600 text-primary-foreground px-8 py-4 rounded-2xl font-heading transition-all shadow-[0_4px_14px_-2px_rgba(0,64,128,0.25)] dark:shadow-[0_4px_14px_-2px_rgba(91,168,229,0.25)] active:scale-95 group"
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
