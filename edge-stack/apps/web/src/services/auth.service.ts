import { client } from "../lib/api";
import type { IUser } from "../types";

/**
 * Authentication and User Profile Service.
 * Pure service layer for communicating with the backend API.
 */
export const authService = {
  /**
   * Fetches the current user profile including workspaces.
   */
  async getProfile() {
    try {
      const userApi = client.api.users.me as any;
      const res = await userApi.$get();

      if (res.ok) {
        const profileData = await res.json();
        return profileData.data;
      }
      throw new Error(`Profile fetch failed: ${res.status}`);
    } catch (error) {
      console.error("[AuthService] getProfile error:", error);
      throw error;
    }
  },

  /**
   * Updates partial user profile data.
   */
  async updateProfile(data: Partial<IUser>) {
    // Implementation for profile update if needed
    console.log("[AuthService] Updating profile:", data);
    // return client.api.users.update.$post({ json: data });
  },
};
