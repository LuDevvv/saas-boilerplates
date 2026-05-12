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
  Music,
  Video,
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
  if (type.startsWith("video/")) return Video;
  if (type.startsWith("audio/")) return Music;
  if (type.includes("json"))     return FileJson;
  if (type.includes("javascript") || type.includes("typescript")) return FileCode;
  if (type.includes("pdf") || type.includes("text")) return FileText;
  return FileIcon;
};

// ─── Upload Row ───────────────────────────────────────────────────────────────

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
          barTone: "bg-fg-disabled",
          icon: <Loader2 className="h-3 w-3 text-fg-muted animate-spin" />,
        };
      case "uploading":
        return {
          label: `Subiendo · ${item.progress}%`,
          tone: "text-primary",
          barTone: "bg-primary",
          icon: <Loader2 className="h-3 w-3 text-primary animate-spin" />,
        };
      case "success":
        return {
          label: "Completado",
          tone: "text-emerald-600 dark:text-emerald-400",
          barTone: "bg-emerald-500",
          icon: <CheckCircle2 className="h-3 w-3 text-emerald-500" />,
        };
      case "error":
        return {
          label: item.error ?? "Error de subida",
          tone: "text-red-500 dark:text-red-400",
          barTone: "bg-red-500",
          icon: <AlertCircle className="h-3 w-3 text-red-500" />,
        };
      case "cancelled":
        return {
          label: "Cancelado",
          tone: "text-fg-muted",
          barTone: "bg-fg-disabled",
          icon: <X className="h-3 w-3 text-fg-muted" />,
        };
    }
  })();

  return (
    <div className="px-4 py-3 hover:bg-surface-muted/40 transition-colors group/row">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="h-9 w-9 rounded-[12px] bg-surface-muted border border-border-subtle flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-fg-muted" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-fg truncate leading-snug" title={item.fileName}>
            {item.fileName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {statusUI.icon}
            <span className={cn("text-[11px] font-normal truncate tabular-nums", statusUI.tone)}>
              {statusUI.label}
            </span>
            <span className="text-[11px] text-fg-muted/50 ml-auto shrink-0 tabular-nums">
              {formatBytes(item.fileSize)}
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="shrink-0">
          {item.status === "uploading" || item.status === "queued" ? (
            <button
              onClick={() => onCancel(item.id)}
              title="Cancelar"
              className="h-7 w-7 rounded-[8px] text-fg-muted hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition-all flex items-center justify-center"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : item.status === "error" ? (
            <button
              onClick={() => onRetry(item.id)}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-all text-[11px] font-medium"
            >
              <RotateCw className="h-3 w-3" />
              Reintentar
            </button>
          ) : (
            <button
              onClick={() => onDismiss(item.id)}
              title="Cerrar"
              className="h-7 w-7 rounded-[8px] text-fg-muted hover:text-fg hover:bg-surface-hover active:scale-95 transition-all flex items-center justify-center"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {(item.status === "uploading" || item.status === "queued") && (
        <div className="mt-2.5 h-1 w-full rounded-full bg-surface-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500 ease-out", statusUI.barTone)}
            style={{ width: `${Math.max(item.progress, 5)}%` }}
          />
        </div>
      )}
    </div>
  );
};

// ─── Tray ─────────────────────────────────────────────────────────────────────

export const UploadTray: FC = () => {
  const items     = useUploadStore((s) => s.items);
  const isOpen    = useUploadStore((s) => s.isTrayOpen);
  const setOpen   = useUploadStore((s) => s.setTrayOpen);
  const cancel    = useUploadStore((s) => s.cancel);
  const remove    = useUploadStore((s) => s.remove);
  const clearAll  = useUploadStore((s) => s.clearAll);

  const { activeWorkspaceId } = useWorkspaceStore();
  const { retry } = useUploadFile(activeWorkspaceId);

  const [collapsed, setCollapsed] = useState(false);
  const [parent] = useAutoAnimate();

  useEffect(() => {
    if (items.length > 0 && !isOpen) setOpen(true);
  }, [items.length, isOpen, setOpen]);

  if (items.length === 0 || !isOpen) return null;

  const portalTarget = typeof document !== "undefined" ? document.body : null;
  if (!portalTarget) return null;

  const inFlight  = items.filter((it) => it.status === "uploading" || it.status === "queued");
  const errored   = items.filter((it) => it.status === "error");
  const completed = items.filter((it) => it.status === "success");

  const heading =
    inFlight.length > 0
      ? `Subiendo ${inFlight.length} archivo${inFlight.length === 1 ? "" : "s"}…`
      : errored.length > 0
        ? `${errored.length} error${errored.length === 1 ? "" : "es"} de subida`
        : `${completed.length} archivo${completed.length === 1 ? "" : "s"} completado${completed.length === 1 ? "" : "s"}`;

  const dotColor =
    inFlight.length > 0 ? "bg-primary animate-pulse" :
    errored.length > 0  ? "bg-red-500" :
    "bg-emerald-500";

  return createPortal(
    <div
      role="region"
      aria-label="Bandeja de subidas"
      className={cn(
        "fixed bottom-5 right-5 z-[9999]",
        "w-[340px] max-w-[calc(100vw-2.5rem)]",
        "rounded-[18px] border border-border bg-surface shadow-xl shadow-black/10",
        "overflow-hidden transition-all duration-300 ease-in-out",
        "animate-in slide-in-from-bottom-6 fade-in duration-200",
        collapsed ? "h-[52px]" : "h-auto",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between gap-3 px-4 py-3 cursor-pointer select-none",
          !collapsed && "border-b border-border-subtle",
        )}
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn("h-2 w-2 rounded-full shrink-0", dotColor)} />
          <p className="text-[13px] font-medium text-fg truncate">{heading}</p>
        </div>

        <div
          className="flex items-center gap-0.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="h-7 w-7 rounded-[8px] text-fg-muted hover:text-fg hover:bg-surface-hover active:scale-90 transition-all flex items-center justify-center"
          >
            {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => { clearAll(); setOpen(false); }}
            className="h-7 w-7 rounded-[8px] text-fg-muted hover:text-red-500 hover:bg-red-500/10 active:scale-90 transition-all flex items-center justify-center"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Items */}
      {!collapsed && (
        <div
          ref={parent}
          className="max-h-[360px] overflow-y-auto custom-scrollbar divide-y divide-border-subtle"
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
