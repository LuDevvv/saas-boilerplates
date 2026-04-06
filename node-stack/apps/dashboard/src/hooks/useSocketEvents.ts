import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSocketStore } from '@/stores/socketStore';
import { useAuthStore } from '@/stores/authStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export interface SocketEvent {
  event: string;
  data: any;
}

const EVENT_TOAST_MAPPING: Record<string, (data: any) => string> = {
  'notification.created': (data) => {
    const notification = data.notification;
    if (notification?.type === 'ai_job_completed') {
      return 'Your AI analysis is ready! [View]';
    }
    return notification?.message || 'New notification received';
  },
  'ai_job.completed': (data) => `AI job ${data.jobId} completed`,
  'webhook.delivery.failed': (data) => `Webhook delivery failed (attempt ${data.attempts})`,
};

export function useSocketEvents() {
  const { socket, connect, disconnect, connectionStatus } = useSocketStore();
  const { isAuthenticated } = useAuthStore();
  const { activeWorkspaceId } = useWorkspaceStore();

  // Handle connection/disconnection
  useEffect(() => {
    if (isAuthenticated) {
      connect(activeWorkspaceId || undefined);
    } else {
      disconnect();
    }
  }, [isAuthenticated]);

  // Handle workspace switching
  useEffect(() => {
    if (socket && connectionStatus === 'connected' && activeWorkspaceId) {
      socket.emit('switch_workspace', { to: activeWorkspaceId });
    }
  }, [activeWorkspaceId, socket, connectionStatus]);

  useEffect(() => {
    if (!socket || connectionStatus !== 'connected') {
      return;
    }

    const handleEvent = (event: string, data: any) => {
      const toastMessage = EVENT_TOAST_MAPPING[event]?.(data);
      if (toastMessage) {
        toast.success(toastMessage, {
          duration: 5000,
          icon: event === 'notification.created' ? '🔔' : '⚡',
        });
      }
    };

    socket.on('notification.created', (data) => handleEvent('notification.created', data));
    socket.on('ai_job.completed', (data) => handleEvent('ai_job.completed', data));
    socket.on('webhook.delivery.failed', (data) => handleEvent('webhook.delivery.failed', data));

    return () => {
      socket.off('notification.created');
      socket.off('ai_job.completed');
      socket.off('webhook.delivery.failed');
    };
  }, [socket, connectionStatus]);
}

export function useSocket() {
  return useSocketStore();
}
