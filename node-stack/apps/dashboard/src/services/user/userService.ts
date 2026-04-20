import { apiClient } from "@/lib/api-client";
import { User, MessageResponse } from "@/types/auth";
import { BaseService } from "../baseService";

class UserService extends BaseService {
  constructor() {
    super("user");
  }

  async getProfile(): Promise<User> {
    return this.handleRequest<User>(
      () => apiClient.get("/user/profile"),
      "user"
    );
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.handleRequest<User>(
      () => apiClient.patch("/user/profile", data),
      "user"
    );
  }

  async uploadProfilePicture(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("file", file);
    
    return this.handleRequest<User>(
      () => apiClient.post("/user/profile/picture", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      }),
      "user"
    );
  }

  async deleteProfilePicture(): Promise<MessageResponse> {
    return this.handleRequest<MessageResponse>(
      () => apiClient.delete("/user/profile/picture"),
      "message"
    );
  }
}

export const userService = new UserService();
