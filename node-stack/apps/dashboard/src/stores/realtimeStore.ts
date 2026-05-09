import { io, Socket } from "socket.io-client";
import { create } from "zustand";

import { cookieTokenStorage } from "@/lib/api";

export interface OnlineUser {
  id: string;
  name: string;
  avatarUrl?: string;
  color?: string;
}

interface RealtimeState {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  activeRoom: string | null;

  connect: () => void;
  disconnect: () => void;
  joinWorkspace: (workspaceId: string) => void;
}

const getBaseUrl = () => {
  const url = import.meta.env.VITE_SERVER_URL;
  if (!url) {
    console.warn("[realtime] VITE_SERVER_URL is not set — socket will not connect in production.");
    return "";
  }
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    console.warn("[realtime] VITE_SERVER_URL is not a valid URL:", url);
    return "";
  }
};

export const useRealtimeStore = create<RealtimeState>((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  activeRoom: null,

  connect: () => {
    const { socket } = get();
    if (socket?.connected) return;

    const token = cookieTokenStorage.getToken();
    if (!token) return;

    const serverUrl = getBaseUrl();
    if (!serverUrl) return;

    const newSocket = io(serverUrl, {
      auth: { token },
      transports: ["websocket"],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    newSocket.on("connect", () => {
      set({ isConnected: true, socket: newSocket });
      const { activeRoom } = get();
      if (activeRoom) {
        newSocket.emit("workspace:join", { workspaceId: activeRoom });
      }
    });

    newSocket.on("disconnect", () => {
      set({ isConnected: false, onlineUsers: [] });
    });

    newSocket.on("workspace:presence", (users: OnlineUser[]) => {
      set({ onlineUsers: users });
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, onlineUsers: [], activeRoom: null });
    }
  },

  joinWorkspace: (workspaceId: string) => {
    const { socket, activeRoom } = get();
    
    if (activeRoom === workspaceId) return;

    if (socket && socket.connected) {
      if (activeRoom) {
        socket.emit("workspace:leave", { workspaceId: activeRoom });
      }
      socket.emit("workspace:join", { workspaceId });
    }

    set({ activeRoom: workspaceId, onlineUsers: [] });
  },
}));
