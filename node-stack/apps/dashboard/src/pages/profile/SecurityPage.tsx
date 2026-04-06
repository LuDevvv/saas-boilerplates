import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function SecurityPage() {
  const { user } = useAuthStore();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account security</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Password</h2>
          <p className="text-gray-600 mb-4">Change your password</p>
          <button className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
            Change Password
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>
          <p className="text-gray-600 mb-4">Add an extra layer of security to your account</p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Enable two-factor authentication</span>
          </label>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
          <p className="text-gray-600">Manage your active sessions</p>
        </div>
      </div>
    </div>
  );
}