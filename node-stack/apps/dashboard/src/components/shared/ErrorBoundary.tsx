import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component, ReactNode, Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  moduleName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 text-center animate-fade-in">
          <div className="bg-surface border border-border rounded-[20px] p-8 md:p-12 max-w-lg shadow-[var(--shadow-card)] relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-rose-500/[0.06] blur-3xl rounded-full pointer-events-none" />

            <div className="relative">
              <div className="bg-rose-500/10 border border-rose-500/15 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-rose-500" />
              </div>

              <h3 className="text-2xl font-heading text-fg mb-3">
                {this.props.moduleName ? `Error en ${this.props.moduleName}` : "Algo salió mal"}
              </h3>

              <p className="text-sm text-fg-secondary mb-8 leading-relaxed">
                Lo sentimos, ha ocurrido un error inesperado al cargar esta sección. Por favor, intenta recargar la página o vuelve más tarde.
              </p>

              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-heading transition-all active:scale-95 shadow-[0_4px_14px_-2px_rgba(244,63,94,0.25)] w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Intentar de nuevo
              </button>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-8 pt-6 border-t border-border-subtle text-left">
                  <p className="text-[10px] font-mono text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-2">
                    Debug Info
                  </p>
                  <p className="text-xs font-mono text-fg-muted overflow-auto max-h-32 p-3 bg-surface-muted rounded-lg border border-border-subtle">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface SkeletonScreenProps {
  rows?: number;
  height?: number;
  className?: string;
}

export const SkeletonScreen = ({ rows = 5, height = 48, className = "" }: SkeletonScreenProps) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} height={height} borderRadius="8px" />
    ))}
  </div>
);

interface ModuleSuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
  moduleName?: string;
}

export const ModuleSuspense = ({
  children,
  fallback,
  moduleName = "Module",
}: ModuleSuspenseProps) => (
  <ErrorBoundary moduleName={moduleName}>
    <Suspense fallback={fallback || <SkeletonScreen />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

export const PageSkeleton = () => (
  <div className="space-y-6 p-6">
    <Skeleton height={32} width={200} borderRadius="8px" />
    <SkeletonScreen rows={8} height={64} />
  </div>
);