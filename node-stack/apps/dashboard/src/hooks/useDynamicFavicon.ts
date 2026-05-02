import { useEffect, useMemo } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useWorkspaces } from '@/features/workspaces/hooks/useWorkspaces';
import { useShallow } from 'zustand/react/shallow';

export const useDynamicFavicon = () => {
  const activeWorkspaceId = useWorkspaceStore(useShallow((state) => state.activeWorkspaceId));
  const { data: workspaces } = useWorkspaces();

  const activeWorkspace = useMemo(() => 
    workspaces?.find(w => w.id === activeWorkspaceId),
    [workspaces, activeWorkspaceId]
  );

  useEffect(() => {
    const favicon = document.getElementById('favicon') as HTMLLinkElement || 
                  document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    
    if (favicon) {
      if (activeWorkspace?.logoUrl) {
        favicon.href = activeWorkspace.logoUrl;
      } else {
        // Fallback to default favicon
        favicon.href = '/favicon.ico';
      }
    }
  }, [activeWorkspace?.logoUrl]);
};
