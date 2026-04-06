import { BaseService } from "../baseService";
import { User } from "@/types/auth";
import { authService } from "../auth/authService";

class UserService extends BaseService {
  constructor() {
    super("/user");
  }

  mapUser(data: any): User {
    return {
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    };
  }

  async getProfile(): Promise<User> {
    const response = await authService.checkStatus();
    const userData = (response as any)?.user || response;
    return this.mapUser(userData);
  }

  async updateProfile(data: any): Promise<User> {
    const response = await this.post<User>("/update", data);
    return this.mapUser(response);
  }

  async uploadProfilePicture(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await this.post<User>("/upload-avatar", formData);
    return this.mapUser(response);
  }

  async deleteProfilePicture(): Promise<any> {
    return await this.delete("/delete-avatar");
  }
}

export const userService = new UserService();
