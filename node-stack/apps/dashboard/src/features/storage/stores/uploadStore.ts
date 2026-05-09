import { create } from "zustand";

export type UploadStatus = "queued" | "uploading" | "success" | "error" | "cancelled";

export interface UploadItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  fileUrl?: string;
  startedAt: number;
  /** Reference to the underlying File so we can retry. */
  file: File;
  /** Abort handle so we can cancel an in-flight XHR. */
  abort?: () => void;
}

interface UploadStoreState {
  items: UploadItem[];
  /** When true, the floating tray UI is open. */
  isTrayOpen: boolean;
}

interface UploadStoreActions {
  add: (file: File) => string;
  setProgress: (id: string, progress: number) => void;
  setStatus: (
    id: string,
    status: UploadStatus,
    extra?: { error?: string; fileUrl?: string }
  ) => void;
  setAbort: (id: string, abort: () => void) => void;
  cancel: (id: string) => void;
  remove: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  setTrayOpen: (open: boolean) => void;
}

export type UploadStore = UploadStoreState & UploadStoreActions;

export const useUploadStore = create<UploadStore>((set, get) => ({
  items: [],
  isTrayOpen: true,

  add: (file) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((s) => ({
      items: [
        {
          id,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          progress: 0,
          status: "queued",
          startedAt: Date.now(),
          file,
        },
        ...s.items,
      ],
      isTrayOpen: true,
    }));
    return id;
  },

  setProgress: (id, progress) =>
    set((s) => ({
      items: s.items.map((it) => (it.id === id ? { ...it, progress } : it)),
    })),

  setStatus: (id, status, extra) =>
    set((s) => ({
      items: s.items.map((it) =>
        it.id === id ? { ...it, status, ...(extra ?? {}) } : it
      ),
    })),

  setAbort: (id, abort) =>
    set((s) => ({
      items: s.items.map((it) => (it.id === id ? { ...it, abort } : it)),
    })),

  cancel: (id) => {
    const item = get().items.find((it) => it.id === id);
    item?.abort?.();
    set((s) => ({
      items: s.items.map((it) =>
        it.id === id ? { ...it, status: "cancelled" } : it
      ),
    }));
  },

  remove: (id) =>
    set((s) => ({ items: s.items.filter((it) => it.id !== id) })),

  clearCompleted: () =>
    set((s) => ({
      items: s.items.filter(
        (it) => it.status !== "success" && it.status !== "cancelled"
      ),
    })),

  clearAll: () => set({ items: [] }),

  setTrayOpen: (open) => set({ isTrayOpen: open }),
}));
