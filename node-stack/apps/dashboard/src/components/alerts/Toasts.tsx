import { Toaster as HotToaster, toast, Toast as HotToast, resolveValue } from "react-hot-toast";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { playToastSound } from "@/utils/audio";

// Types for Rich Toasts
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

// --- Component System ---

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

const CustomToast = ({ t }: { t: HotToast }) => {
  const isRich = typeof t.message === "object" && t.message !== null && "title" in (t.message as unknown as Record<string, unknown>);

  const payload = isRich
    ? (t.message as unknown as RichToastPayload)
    : { title: resolveValue(t.message, t) as string, description: "" };

  const type = t.type;

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-white dark:bg-canvas",
          border: "border-l-[3px] border-l-emerald-500 border-gray-200 dark:border-gray-800",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          title: "text-gray-900 dark:text-gray-100",
          progress: "bg-emerald-500/20",
        };
      case "error":
        return {
          bg: "bg-white dark:bg-canvas",
          border: "border-l-[3px] border-l-rose-500 border-gray-200 dark:border-gray-800",
          icon: <XCircle className="w-4 h-4 text-rose-500" />,
          title: "text-gray-900 dark:text-gray-100",
          progress: "bg-rose-500/20",
        };
      case "loading":
        return {
          bg: "bg-white dark:bg-canvas",
          border: "border-l-[3px] border-l-indigo-500 border-gray-200 dark:border-gray-800",
          icon: <Info className="w-4 h-4 text-indigo-500 animate-pulse" />,
          title: "text-gray-900 dark:text-gray-100",
          progress: "bg-indigo-500/20",
        };
      default:
        return {
          bg: "bg-white dark:bg-canvas",
          border: "border-l-[3px] border-l-blue-500 border-gray-200 dark:border-gray-800",
          icon: <Info className="w-4 h-4 text-blue-500" />,
          title: "text-gray-900 dark:text-gray-100",
          progress: "bg-blue-500/20",
        };
    }
  };

  const style = getStyles();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (t.visible) setIsMounted(true);
  }, [t.visible]);

  return (
    <div
      className={`${t.visible
          ? (isMounted ? "animate-toast-enter" : "opacity-0")
          : "animate-toast-exit"
        } max-w-[340px] w-full ${style.bg} ${style.border} shadow-[0_4px_20px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-lg pointer-events-auto flex flex-col border border-y-gray-200/50 border-r-gray-200/50 dark:border-y-gray-800/80 dark:border-r-gray-800/80 p-3.5 overflow-hidden relative`}
      style={{ '--toast-duration': `${t.duration || 5000}ms` } as React.CSSProperties}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>

        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-bold  ${style.title}`}>
            {payload.title}
          </p>
          {payload.description && (
            <p className="mt-0.5 text-[12px] text-fg-secondary font-medium leading-tight line-clamp-2">
              {payload.description}
            </p>
          )}
        </div>

        <div className="flex flex-shrink-0 ml-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="p-1 -mr-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none transition-colors"
          >
            <span className="sr-only">Close</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 h-[1.5px] w-full ${style.progress} animate-toast-progress`} />

      {payload.actions && payload.actions.length > 0 && (
        <div className="mt-4 flex gap-3 justify-end items-center">
          {payload.actions.map((act, i) => (
            <button
              key={i}
              onClick={() => {
                act.onClick();
                if (act.dismissOnClick !== false) toast.dismiss(t.id);
              }}
              className={`text-sm font-semibold transition-all active:scale-95 ${act.variant === 'danger'
                  ? 'text-rose-600 hover:text-rose-700 dark:text-rose-500 dark:hover:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-lg'
                  : act.variant === 'primary'
                    ? 'text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-lg shadow-sm shadow-primary-500/20'
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

import { ToastOptions } from "react-hot-toast";
import { AppError } from "@node-stack/api-client";

export const appToast = {
  success: (payload: RichToastPayload | string, options?: ToastOptions) => {
    playToastSound('success');
    return toast.success(payload as unknown as string, options);
  },
  error: (payload: RichToastPayload | string | AppError | any, options?: ToastOptions) => {
    playToastSound('error');

    if (payload instanceof AppError) {
      const description = payload.fieldErrors
        ? Object.entries(payload.fieldErrors).map(([field, msgs]) => `${field}: ${msgs.join(', ')}`).join('. ')
        : undefined;

      return toast.error({
        title: payload.message || "Ha ocurrido un error",
        description: description,
      } as any, options);
    }

    if (typeof payload === 'string') {
      return toast.error(payload, options);
    }

    return toast.error(payload as any, options);
  },
  info: (payload: RichToastPayload | string, options?: ToastOptions) => {
    playToastSound('info');
    return toast(payload as unknown as string, options);
  },
  warning: (payload: RichToastPayload | string, options?: ToastOptions) => {
    playToastSound('warning');
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
