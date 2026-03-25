import { apiClient } from "./client";
import type {
  LoginCredentials,
  LoginResponse,
  AuthUser,
} from "@/types/auth.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data: response } = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/dashboard/login",
      credentials,
    );
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    const { data: response } = await apiClient.post<ApiResponse<{ accessToken: string }>>(
      "/auth/refresh",
    );
    return response.data;
  },

  async getMe(): Promise<AuthUser> {
    const { data: response } = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
    return response.data;
  },
};
