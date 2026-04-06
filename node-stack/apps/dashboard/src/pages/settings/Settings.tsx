import { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspaceStore";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const { activeWorkspace } = useWorkspaceStore();

  const tabs = [
    { id: "general", label: "General" },
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your workspace settings</p>
      </div>

      <div className="flex gap-4 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 -mb-px border-b-2 ${
              activeTab === tab.id
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <p className="text-gray-600">Settings for: {activeWorkspace?.name || "No workspace selected"}</p>
      </div>
    </div>
  );
}