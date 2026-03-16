import { apiClient } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  created_at: string;
  total_debates: number;
  avg_score: number;
}

export const userService = {
  async getProfile(): Promise<User> {
    return apiClient.get<User>("/api/user/profile");
  },

  async updateProfile(data: { username?: string; full_name?: string }): Promise<User> {
    return apiClient.put<User>("/api/user/profile", data);
  },
};