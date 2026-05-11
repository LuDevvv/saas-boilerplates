import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  FileJson,
  FileCode,
  File as FileIcon,
} from "lucide-react";
import { FC, useState, useEffect } from "react";
import { createPortal } from "react-dom";

import { useUploadFile } from "../hooks/useStorage";
import { useUploadStore, type UploadItem } from "../stores/uploadStore";

import { useWorkspaceStore } from "@/stores/workspaceStore";
import { cn } from "@/utils/classNames";
import { formatBytes } from "@/utils/formatters";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.includes("json")) return FileJson;
  if (type.includes("javascript") || type.includes("typescript")) return FileCode;
  if (type.includes("pdf") || type.includes("text")) return FileText;
  return FileIcon;
};

// ─── Row ─────────────────────────────────────────────────────────────────────

const UploadRow: FC<{
  item: UploadItem;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  onDismiss: (id: string) => void;
}> = ({ item, onRetry, onCancel, onDismiss }) => {
  const Icon = getFileIcon(item.fileType);

  const statusUI = (() => {
    switch (item.status) {
      case "queued":
        return {
          label: "En cola",
          tone: "text-fg-muted",
          barTone: "bg-fg-muted",
          icon: <Loader2 className="h-3.5 w-3.5 text-fg-muted animate-spin" />,
        };
      case "uploading":
        return {
          label: `Subiendo · ${item.progress}%`,
          tone: "text-primary-600 dark:text-primary-400",
          barTone: "bg-primary-500",
          icon: <Loader2 className="h-3.5 w-3.5 text-primary-500 animate-spin" />,
        };
      case "success":
        return {
          label: "Completado",
          tone: "text-emerald-600 dark:text-emerald-400",
          barTone: "bg-emerald-500",
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
        };
      case "error":
        return {
          label: item.error ?? "Error de subida",
          tone: "text-red-600 dark:text-red-400",
          barTone: "bg-red-500",
          icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
        };
      case "cancelled":
        return {
          label: "Cancelado",
          tone: "text-fg-muted",
          barTone: "bg-fg-muted",
          icon: <X className="h-3.5 w-3.5 text-fg-muted" />,
        };
    }
  })();

  return (
    <div className="px-5 py-4 hover:bg-surface-muted/50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-[14px] bg-surface-muted border border-border-subtle flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
          <Icon className="h-5 w-5 text-fg-muted" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-fg truncate" title={item.fileName}>
            {item.fileName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {statusUI.icon}
            <span className={cn("text-[11px] font-medium  truncate tabular-nums", statusUI.tone)}>
              {statusUI.label}
            </span>
            <span className="text-[11px] font-medium text-fg-muted/60 ml-auto shrink-0 tabular-nums">
              {formatBytes(item.fileSize)}
            </span>
          </div>
        </div>

        {/* Action by status */}
        <div className="shrink-0 ml-2">
          {item.status === "uploading" || item.status === "queued" ? (
            <button
              onClick={() => onCancel(item.id)}
              className="h-8 w-8 rounded-xl text-fg-muted hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition-all flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          ) : item.status === "error" ? (
            <button
              onClick={() => onRetry(item.id)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all text-[11px] font-bold uppercase "
            >
              <RotateCw className="h-3 w-3" />
              Reintentar
            </button>
          ) : (
            <button
              onClick={() => onDismiss(item.id)}
              className="h-8 w-8 rounded-xl text-fg-muted hover:text-fg hover:bg-surface-hover active:scale-95 transition-all flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar (only relevant while uploading) */}
      {(item.status === "uploading" || item.status === "queued") && (
        <div className="mt-3 h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
          <div
            className={cn("h-full transition-all duration-500 ease-out", statusUI.barTone)}
            style={{ width: `${Math.max(item.progress, 5)}%` }}
          />
        </div>
      )}
    </div>
  );
};

// ─── Tray ────────────────────────────────────────────────────────────────────

export const UploadTray: FC = () => {
  const items = useUploadStore((s) => s.items);
  const isOpen = useUploadStore((s) => s.isTrayOpen);
  const setOpen = useUploadStore((s) => s.setTrayOpen);
  const cancel = useUploadStore((s) => s.cancel);
  const remove = useUploadStore((s) => s.remove);
  const clearAll = useUploadStore((s) => s.clearAll);

  const { activeWorkspaceId } = useWorkspaceStore();
  const { retry } = useUploadFile(activeWorkspaceId);

  const [collapsed, setCollapsed] = useState(false);
  const [parent] = useAutoAnimate();

  // If items are added and tray is closed, open it automatically
  useEffect(() => {
    if (items.length > 0 && !isOpen) {
      setOpen(true);
    }
  }, [items.length, isOpen, setOpen]);

  if (items.length === 0 || !isOpen) return null;

  // Portal to document.body ensures position:fixed is viewport-relative even
  // when rendered inside a parent with CSS transforms (MotionContainer, etc.)
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  if (!portalTarget) return null;

  const inFlight = items.filter(
    (it) => it.status === "uploading" || it.status === "queued"
  );
  const errored = items.filter((it) => it.status === "error");
  const completed = items.filter((it) => it.status === "success");

  const heading =
    inFlight.length > 0
      ? `Subiendo ${inFlight.length} archivo${inFlight.length === 1 ? "" : "s"}…`
      : errored.length > 0
        ? `${errored.length} subida${errored.length === 1 ? "" : "s"} fallida${errored.length === 1 ? "" : "s"}`
        : `${completed.length} archivo${completed.length === 1 ? "" : "s"} listo${completed.length === 1 ? "" : "s"}`;

  return createPortal(
    <div
      role="region"
      aria-label="Bandeja de subidas"
      className={cn(
        "fixed bottom-6 right-6 z-[9999] w-[380px] max-w-[calc(100vw-3rem)] rounded-[24px] border border-border bg-surface-elevated shadow-2xl shadow-primary/10 overflow-hidden transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-8 fade-in",
        collapsed ? "h-[64px]" : "h-auto"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between gap-3 px-5 py-4 border-b border-border-subtle bg-surface-muted/30 cursor-pointer select-none",
          collapsed && "border-b-0"
        )}
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "h-2 w-2 rounded-full",
            inFlight.length > 0 ? "bg-primary animate-pulse" :
              errored.length > 0 ? "bg-red-500" : "bg-emerald-500"
          )} />
          <p className="text-[13px] font-black text-fg truncate uppercase ">{heading}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="h-8 w-8 rounded-xl text-fg-muted hover:text-fg hover:bg-surface-hover active:scale-90 transition-all flex items-center justify-center"
          >
            {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              clearAll();
              setOpen(false);
            }}
            className="h-8 w-8 rounded-xl text-fg-muted hover:text-red-500 hover:bg-red-500/10 active:scale-90 transition-all flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Items */}
      {!collapsed && (
        <div
          ref={parent}
          className="max-h-[450px] overflow-y-auto custom-scrollbar divide-y divide-border-subtle"
        >
          {items.map((it) => (
            <UploadRow
              key={it.id}
              item={it}
              onRetry={retry}
              onCancel={cancel}
              onDismiss={remove}
            />
          ))}
        </div>
      )}
    </div>,
    portalTarget,
  );
};
