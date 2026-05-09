import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { queryKeys } from "@/lib/react-query/queryKeys";
import { useAuthStore } from "@/stores/authStore";
import { useRealtimeStore } from "@/stores/realtimeStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";

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
    
    const handleNewNotification = (_notification: unknown) => {
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
