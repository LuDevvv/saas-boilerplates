import { Component, ReactNode, Suspense } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
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
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
          <div className="bg-rose-50 dark:bg-rose-500/10 rounded-xl p-6 max-w-md">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {this.props.moduleName ? `${this.props.moduleName} Error` : "Something went wrong"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
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