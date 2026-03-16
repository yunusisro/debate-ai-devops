// src/services/authService.ts
import { apiClient } from "@/lib/api";

interface LoginPayload {
  email: string;
  password: string;
}

interface SignupPayload {
  email: string;
  password: string;
  username: string;
  full_name?: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const data = await apiClient.post<AuthResponse>(
      "/api/auth/login",
      payload
    );
    apiClient.setToken(data.access_token);
    return data;
  },

  async signup(payload: SignupPayload): Promise<AuthResponse> {
    const data = await apiClient.post<AuthResponse>(
      "/api/auth/signup",
      payload
    );
    apiClient.setToken(data.access_token);
    return data;
  },

  logout() {
    apiClient.clearToken();
  },
};