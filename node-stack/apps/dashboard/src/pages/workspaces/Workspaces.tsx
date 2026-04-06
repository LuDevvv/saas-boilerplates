import { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";

export default function Workspaces() {
  const { workspaces, activeWorkspaceId, setActiveWorkspaceId, loading } = useWorkspaceStore();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workspaces</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your workspaces</p>
      </div>

      {loading && <p>Loading workspaces...</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className={`p-4 border rounded-lg cursor-pointer ${
              activeWorkspaceId === workspace.id ? "border-primary-500 bg-primary-50" : "border-gray-200"
            }`}
            onClick={() => setActiveWorkspaceId(workspace.id)}
          >
            <h3 className="font-semibold">{workspace.name}</h3>
            <p className="text-sm text-gray-500">{workspace.slug}</p>
          </div>
        ))}
      </div>

      {workspaces.length === 0 && !loading && (
        <p className="text-gray-500">No workspaces found.</p>
      )}
    </div>
  );
}