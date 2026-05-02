import { Toaster as HotToaster, toast, Toast as HotToast, resolveValue } from "react-hot-toast";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { playToastSound } from "@/utils/audio";

// The new Custom Toast Component replacing the Minimalist
export const Toasts = () => {
  return (
    <HotToaster
      position="top-right"
      reverseOrder={false}
      gutter={16}
      toastOptions={{
        duration: 5000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
          maxWidth: '340px',
        },
      }}
    >
      {(t) => <CustomToast t={t} />}
    </HotToaster>
  );
};

// Internal custom toast renderer
const CustomToast = ({ t }: { t: HotToast }) => {
  // Determine if it's our rich payload or a standard string
  const isRich = typeof t.message === "object" && t.message !== null && "title" in (t.message as unknown as Record<string, unknown>);

  const payload = isRich
    ? (t.message as unknown as RichToastPayload)
    : { title: resolveValue(t.message, t) as string, description: "" };

  const type = t.type;

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-white/95 dark:bg-[#111111]/95 backdrop-blur-xl",
          border: "border border-gray-200/60 dark:border-white/10 border-l-[4px] border-l-emerald-500",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          title: "text-gray-900 dark:text-white",
          progress: "bg-emerald-500/20",
        };
      case "error":
        return {
          bg: "bg-white/95 dark:bg-[#111111]/95 backdrop-blur-xl",
          border: "border border-gray-200/60 dark:border-white/10 border-l-[4px] border-l-rose-500",
          icon: <XCircle className="w-5 h-5 text-rose-500" />,
          title: "text-gray-900 dark:text-white",
          progress: "bg-rose-500/20",
        };
      case "loading":
        return {
          bg: "bg-white/95 dark:bg-[#111111]/95 backdrop-blur-xl",
          border: "border border-gray-200/60 dark:border-white/10 border-l-[4px] border-l-indigo-500",
          icon: <Info className="w-5 h-5 text-indigo-500 animate-pulse" />,
          title: "text-gray-900 dark:text-white",
          progress: "bg-indigo-500/20",
        };
      default:
        // Info or Custom
        return {
          bg: "bg-white/95 dark:bg-[#111111]/95 backdrop-blur-xl",
          border: "border border-gray-200/60 dark:border-white/10 border-l-[4px] border-l-primary",
          icon: <Info className="w-5 h-5 text-primary" />,
          title: "text-gray-900 dark:text-white",
          progress: "bg-primary/20",
        };
    }
  };

  const style = getStyles();

  // Local state to track initial mount for animation
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (t.visible) setIsMounted(true);
  }, [t.visible]);

  return (
    <div
      className={`${t.visible
          ? (isMounted ? "animate-toast-enter" : "opacity-0")
          : "animate-toast-exit"
        } max-w-[340px] w-full ${style.bg} ${style.border} shadow-premium dark:shadow-none rounded-[16px] pointer-events-auto flex flex-col p-4 overflow-hidden relative`}
      style={{ '--toast-duration': `${t.duration || 5000}ms` } as React.CSSProperties}
    >
      <div className="flex items-start gap-3.5">
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>

        <div className="flex-1 min-w-0">
          <p className={`text-[14px] font-heading leading-tight ${style.title}`}>
            {payload.title}
          </p>
          {payload.description && (
            <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-400 font-label leading-relaxed line-clamp-2">
              {payload.description}
            </p>
          )}
        </div>

        <div className="flex flex-shrink-0 ml-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="p-1 -mr-2 -mt-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors bg-transparent rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <span className="sr-only">Cerrar</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtle Progress Bar */}
      <div
        className={`absolute bottom-0 left-0 h-[1.5px] w-full ${style.progress} animate-toast-progress`}
      />

      {/* Optional action buttons area */}
      {payload.actions && payload.actions.length > 0 && (
        <div className="mt-4 flex gap-3 justify-end items-center">
          {payload.actions.map((act, i) => (
            <button
              key={i}
              onClick={() => {
                act.onClick();
                if (act.dismissOnClick !== false) toast.dismiss(t.id);
              }}
              className={`text-sm font-label transition-all active:scale-95 ${act.variant === 'danger'
                  ? 'text-rose-600 hover:text-rose-700 dark:text-rose-500 dark:hover:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-lg'
                  : act.variant === 'primary'
                    ? 'text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-lg shadow-sm shadow-blue-900/20'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
            >
              {act.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Rich API for new Semantic Toasts
// Standard react-hot-toast doesn't support structured JSX parameters out of the box nicely alongside string messages 
// without messing up typings on use. This wrapper extends it.
import { ToastOptions } from "react-hot-toast";

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'ghost' | 'primary' | 'danger';
  dismissOnClick?: boolean; // defaults to true
}

export interface RichToastPayload {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  actions?: ToastAction[];
}

export const appToast = {
  success: (payload: RichToastPayload | string, options?: ToastOptions) => {
    playToastSound('success');
    return toast.success(payload as unknown as string, options);
  },
  error: (payload: RichToastPayload | string, options?: ToastOptions) => {
    playToastSound('error');
    return toast.error(payload as unknown as string, options);
  },
  info: (payload: RichToastPayload | string, options?: ToastOptions) => {
    playToastSound('info');
    return toast(payload as unknown as string, options);
  },
  warning: (payload: RichToastPayload | string, options?: ToastOptions) => {
    playToastSound('warning');
    // Actually log the payload or pass it if you created a custom warning toast.
    return toast.custom((t) => (
      <CustomToast t={{ ...t, type: 'custom', message: payload as any }} />
    ), options);
  },
  dismiss: toast.dismiss,
  loading: (payload: RichToastPayload | string, options?: ToastOptions) => {
    playToastSound('loading');
    return toast.loading(payload as unknown as string, options);
  },
};

export default Toasts;
