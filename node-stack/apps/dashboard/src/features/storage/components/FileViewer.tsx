/**
 * FileViewer — inline file preview modal.
 *
 * Supports: images (pan/zoom canvas), PDFs, text/code, video, audio.
 * Keyboard: Esc = close, ← → = navigate, +/- = zoom.
 * Image interaction: wheel = zoom, drag = pan, double-click = zoom toggle.
 */

import type { FileInfo as StorageFile } from "@node-stack/types";
import {
  X, Download, ChevronLeft, ChevronRight, ExternalLink,
  FileText, Image as ImageIcon, FileCode,
  File as FileIcon, Music, Video, ZoomIn, ZoomOut, RotateCw,
} from "lucide-react";
import {
  FC, useEffect, useState, useCallback, useRef,
  MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/utils/classNames";
import { formatBytes } from "@/utils/formatters";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FileViewerProps {
  file: StorageFile | null;
  files?: StorageFile[];
  onClose: () => void;
  onDownload?: (file: StorageFile) => void;
}

type FileKind = "image" | "pdf" | "text" | "video" | "audio" | "unsupported";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getKind = (mime: string): FileKind => {
  if (mime.startsWith("image/")) return "image";
  if (mime.includes("pdf")) return "pdf";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (
    mime.startsWith("text/") || mime.includes("json") ||
    mime.includes("javascript") || mime.includes("typescript") || mime.includes("xml")
  ) return "text";
  return "unsupported";
};

const kindIcon = (kind: FileKind) => {
  const map: Record<FileKind, typeof FileIcon> = {
    image: ImageIcon, pdf: FileText, text: FileCode,
    video: Video, audio: Music, unsupported: FileIcon,
  };
  return map[kind];
};

const kindLabel: Record<FileKind, string> = {
  image: "Imagen", pdf: "PDF", text: "Texto / Código",
  video: "Video", audio: "Audio", unsupported: "Archivo",
};

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 8;
const ZOOM_STEP = 0.12; // per wheel tick

// ─── Image Preview (canvas-style pan + zoom) ──────────────────────────────────

const ImagePreview: FC<{ url: string; name: string }> = ({ url, name }) => {
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);

  // Reset pan when zoom returns to 1
  useEffect(() => {
    if (zoom <= 1) setOffset({ x: 0, y: 0 });
  }, [zoom]);

  // Mouse-wheel zoom — zoom toward cursor position
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      // Cursor position relative to container center
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;

      setZoom((prev) => {
        const factor = e.deltaY < 0 ? 1 + ZOOM_STEP : 1 - ZOOM_STEP;
        const next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, prev * factor));
        const scale = next / prev;
        // Shift offset so zoom centers on the cursor
        setOffset((o) => ({
          x: cx + (o.x - cx) * scale,
          y: cy + (o.y - cy) * scale,
        }));
        return next;
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleMouseDown = useCallback((e: ReactMouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    setDragging(true);
    dragOrigin.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  const handleMouseMove = useCallback((e: ReactMouseEvent) => {
    if (!dragging || !dragOrigin.current) return;
    setOffset({
      x: dragOrigin.current.ox + (e.clientX - dragOrigin.current.mx),
      y: dragOrigin.current.oy + (e.clientY - dragOrigin.current.my),
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    dragOrigin.current = null;
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (zoom > 1) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    } else {
      setZoom(2.5);
    }
  }, [zoom]);

  const reset = () => { setZoom(1); setRotate(0); setOffset({ x: 0, y: 0 }); };

  const cursor = dragging ? "cursor-grabbing" : zoom > 1 ? "cursor-grab" : "cursor-zoom-in";

  return (
    <div className="relative h-full flex flex-col bg-[#0c0c0f] dark:bg-[#070709] select-none">

      {/* Floating toolbar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 rounded-full px-1.5 py-1 border border-white/10 bg-black/55 backdrop-blur-md shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - 0.25))}
          className="h-7 w-7 flex items-center justify-center text-white/65 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <span className="text-white/65 text-[11px] font-medium tabular-nums w-10 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + 0.25))}
          className="h-7 w-7 flex items-center justify-center text-white/65 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <div className="w-px h-3.5 bg-white/15 mx-1" />
        <button
          onClick={() => setRotate((r) => (r + 90) % 360)}
          title="Rotar 90°"
          className="h-7 w-7 flex items-center justify-center text-white/65 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={reset}
          className="text-white/50 hover:text-white/85 text-[11px] font-medium transition-colors rounded-full hover:bg-white/10 px-2.5 py-1"
        >
          Restablecer
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className={cn("flex-1 flex items-center justify-center overflow-hidden", cursor)}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={url}
          alt={name}
          draggable={false}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotate}deg)`,
            transition: dragging ? "none" : "transform 0.15s ease-out",
            transformOrigin: "center center",
            maxWidth: "calc(100% - 32px)",
            maxHeight: "calc(100% - 72px)",
            objectFit: "contain",
            pointerEvents: "none",
            userSelect: "none",
          }}
          className="rounded-sm shadow-2xl"
        />
      </div>

      {/* Hint */}
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/25 pointer-events-none whitespace-nowrap">
        Rueda para zoom · Arrastra para mover · Doble clic para ampliar
      </p>
    </div>
  );
};

// ─── PDF Preview ──────────────────────────────────────────────────────────────

const PdfPreview: FC<{ url: string }> = ({ url }) => (
  <iframe
    src={`${url}#toolbar=1&view=FitH&zoom=page-fit`}
    className="w-full h-full border-0"
    title="Vista previa PDF"
  />
);

// ─── Video Preview ────────────────────────────────────────────────────────────

const VideoPreview: FC<{ url: string; mime: string }> = ({ url, mime }) => (
  <div className="flex items-center justify-center h-full bg-black">
    {/* video/audio without captions — acceptable for user-uploaded media previews */}
    {/* eslint-disable-next-line */}
    <video src={url} controls className="max-w-full max-h-full">
      <source src={url} type={mime} />
    </video>
  </div>
);

// ─── Audio Preview ────────────────────────────────────────────────────────────

const AudioPreview: FC<{ url: string; name: string; mime: string }> = ({ url, name, mime }) => (
  <div className="flex flex-col items-center justify-center h-full gap-5 p-8 bg-surface">
    <div className="h-18 w-18 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
      <Music className="h-8 w-8 text-primary" />
    </div>
    <p className="text-[13px] font-medium text-fg text-center max-w-xs truncate">{name}</p>
    {/* eslint-disable-next-line */}
    <audio controls className="w-full max-w-sm" src={url}>
      <source src={url} type={mime} />
    </audio>
  </div>
);

// ─── Text Preview ─────────────────────────────────────────────────────────────

const TextPreview: FC<{ url: string }> = ({ url }) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(url)
      .then((r) => r.text())
      .then((t) => { setContent(t); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-surface">
        <div className="h-7 w-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-surface">
        <p className="text-fg-muted text-[13px]">No se pudo cargar el archivo.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-[#0d1117]">
      <pre className="p-5 text-[12px] sm:text-[13px] text-[#e6edf3] font-mono leading-relaxed whitespace-pre-wrap break-words">
        {content}
      </pre>
    </div>
  );
};

// ─── Unsupported ──────────────────────────────────────────────────────────────

const UnsupportedPreview: FC<{ file: StorageFile; onDownload?: () => void }> = ({ file, onDownload }) => {
  const KindIcon = kindIcon(getKind(file.type ?? ""));
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center bg-surface">
      <div className="h-16 w-16 rounded-2xl bg-surface-muted border border-border flex items-center justify-center">
        <KindIcon className="h-8 w-8 text-fg-muted" />
      </div>
      <div>
        <p className="text-fg text-[14px] font-medium">Vista previa no disponible</p>
        <p className="text-fg-muted text-[12px] mt-1">Este tipo de archivo no puede previsualizarse.</p>
      </div>
      {onDownload && (
        <button
          onClick={onDownload}
          className="flex items-center gap-2 h-9 px-4 rounded-[10px] bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors active:scale-[0.97]"
        >
          <Download className="h-3.5 w-3.5" />
          Descargar archivo
        </button>
      )}
    </div>
  );
};

// ─── Main modal ───────────────────────────────────────────────────────────────

export const FileViewer: FC<FileViewerProps> = ({ file, files = [], onClose, onDownload }) => {
  const [activeFile, setActiveFile] = useState<StorageFile | null>(file);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setActiveFile(file); }, [file]);

  const currentIndex = files.findIndex((f) => f.id === activeFile?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < files.length - 1;

  const navigateTo = useCallback((idx: number) => {
    if (idx >= 0 && idx < files.length) setActiveFile(files[idx]!);
  }, [files]);

  // Keyboard navigation
  useEffect(() => {
    if (!file) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key === "ArrowLeft" && hasPrev) navigateTo(currentIndex - 1);
      if (e.key === "ArrowRight" && hasNext) navigateTo(currentIndex + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [file, onClose, hasPrev, hasNext, currentIndex, navigateTo]);

  if (!activeFile) return null;

  const kind = getKind(activeFile.type ?? "");
  const KindIcon = kindIcon(kind);
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  if (!portalTarget) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  return createPortal(
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className={cn(
        "fixed inset-0 z-[9998] flex items-center justify-center",
        "bg-black/50 dark:bg-black/75",
        "animate-in fade-in duration-150",
        // No backdrop-blur on the overlay — keep it clean
      )}
      role="dialog"
      aria-modal
      aria-label={`Vista previa: ${activeFile.name}`}
    >
      {/* Modal — fixed size so content area always fills it */}
      <div
        className={cn(
          "relative flex flex-col",
          // Mobile: full screen
          "w-full h-full",
          // Desktop: fixed dimensions so flex-1 content fills correctly
          "sm:w-[min(1000px,92vw)] sm:h-[min(750px,88vh)]",
          "sm:rounded-[20px] overflow-hidden",
          "bg-surface border border-border",
          "shadow-[var(--shadow-elevated)]",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0 bg-surface">
          <div className="h-8 w-8 rounded-[10px] bg-surface-muted border border-border flex items-center justify-center shrink-0">
            <KindIcon className="h-4 w-4 text-fg-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-fg truncate leading-snug" title={activeFile.name}>
              {activeFile.name}
            </p>
            <p className="text-[11px] text-fg-muted mt-0.5">
              {kindLabel[kind]} · {formatBytes(activeFile.size)}
            </p>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {onDownload && (
              <button
                onClick={() => onDownload(activeFile)}
                title="Descargar"
                className="h-8 w-8 flex items-center justify-center rounded-[8px] text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => window.open(activeFile.url, "_blank")}
              title="Abrir en nueva pestaña"
              className="h-8 w-8 flex items-center justify-center rounded-[8px] text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={onClose}
              title="Cerrar (Esc)"
              className="h-8 w-8 flex items-center justify-center rounded-[8px] text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Content — flex-1 fills the remaining height ── */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {kind === "image"       && <ImagePreview url={activeFile.url} name={activeFile.name} />}
          {kind === "pdf"         && <PdfPreview url={activeFile.url} />}
          {kind === "video"       && <VideoPreview url={activeFile.url} mime={activeFile.type} />}
          {kind === "audio"       && <AudioPreview url={activeFile.url} name={activeFile.name} mime={activeFile.type} />}
          {kind === "text"        && <TextPreview url={activeFile.url} />}
          {kind === "unsupported" && (
            <UnsupportedPreview
              file={activeFile}
              onDownload={onDownload ? () => onDownload(activeFile) : undefined}
            />
          )}
        </div>

        {/* ── Navigation footer ── */}
        {files.length > 1 && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-border bg-surface shrink-0">
            <button
              onClick={() => navigateTo(currentIndex - 1)}
              disabled={!hasPrev}
              className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] text-[12px] font-medium text-fg-muted hover:text-fg hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Anterior
            </button>
            <span className="text-[11px] text-fg-muted tabular-nums">
              {currentIndex + 1} / {files.length}
            </span>
            <button
              onClick={() => navigateTo(currentIndex + 1)}
              disabled={!hasNext}
              className="flex items-center gap-1.5 h-8 px-3 rounded-[8px] text-[12px] font-medium text-fg-muted hover:text-fg hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Siguiente
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>,
    portalTarget,
  );
};
