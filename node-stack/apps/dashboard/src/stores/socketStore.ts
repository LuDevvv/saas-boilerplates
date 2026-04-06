import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '@/lib/api-client';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

interface SocketState {
  socket: Socket | null;
  connectionStatus: ConnectionStatus;
  lastEventId: number;
  reconnectAttempts: number;

  connect: (workspaceId?: string) => void;
  disconnect: () => void;
  setLastEventId: (id: number) => void;
}

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';
const NAMESPACE = '/v1/realtime';

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connectionStatus: 'disconnected',
  lastEventId: 0,
  reconnectAttempts: 0,

  connect: (workspaceId?: string) => {
    const { socket: existingSocket, connectionStatus } = get();
    
    if (existingSocket && connectionStatus === 'connected') {
      return;
    }

    if (existingSocket) {
      existingSocket.disconnect();
    }

    const token = apiClient.getToken();
    if (!token) {
      console.warn('Cannot connect to socket: no auth token');
      return;
    }

    const socket = io(`${SOCKET_URL}${NAMESPACE}`, {
      auth: {
        token: `Bearer ${token}`,
      },
      query: {
        workspaceId: workspaceId || '',
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      set({ 
        connectionStatus: 'connected', 
        reconnectAttempts: 0 
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      set({ connectionStatus: 'disconnected' });
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[Socket] Reconnect attempt:', attemptNumber);
      set({ 
        connectionStatus: 'reconnecting',
        reconnectAttempts: attemptNumber,
      });
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
      set({ connectionStatus: 'connected' });
      
      const { lastEventId } = get();
      if (lastEventId > 0) {
        socket.emit('sync_events', { lastEventId });
      }
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      if (error.message.includes('Unauthorized')) {
        get().disconnect();
      }
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, connectionStatus: 'disconnected' });
    }
  },

  setLastEventId: (id: number) => {
    set({ lastEventId: Math.max(id, get().lastEventId) });
  },
}));
