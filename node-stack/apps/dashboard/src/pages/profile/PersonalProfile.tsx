import { useAuthStore } from "@/stores/authStore";

export default function PersonalProfile() {
  const { user } = useAuthStore();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your personal information</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Name</label>
            <p className="text-lg">{(user as any)?.name || (user as any)?.firstName || "N/A"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <p className="text-lg">{user?.email || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}