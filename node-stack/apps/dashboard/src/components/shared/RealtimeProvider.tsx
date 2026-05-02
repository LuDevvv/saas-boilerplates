import React, { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useRealtimeStore } from "@/stores/realtimeStore";
import { useShallow } from "zustand/react/shallow";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore(useShallow((state) => state.isAuthenticated));
  const activeWorkspaceId = useWorkspaceStore(useShallow((state) => state.activeWorkspaceId));
  const connect = useRealtimeStore(useShallow((state) => state.connect));
  const disconnect = useRealtimeStore(useShallow((state) => state.disconnect));
  const joinWorkspace = useRealtimeStore(useShallow((state) => state.joinWorkspace));
  const socket = useRealtimeStore(useShallow((state) => state.socket));
  
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }
  }, [isAuthenticated, connect, disconnect]);

  useEffect(() => {
    if (isAuthenticated && activeWorkspaceId) {
      joinWorkspace(activeWorkspaceId);
    }
  }, [isAuthenticated, activeWorkspaceId, joinWorkspace]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewNotification = (_notification: any) => {
      // Invalidate queries to fetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket, queryClient]);

  return <>{children}</>;
};
