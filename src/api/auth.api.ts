import { apiClient } from "./client";
import type {
  LoginCredentials,
  LoginResponse,
  AuthUser,
} from "@/types/auth.types";

export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials,
    );
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    const { data } = await apiClient.post<{ accessToken: string }>(
      "/auth/refresh",
    );
    return data;
  },

  async getMe(): Promise<AuthUser> {
    const { data } = await apiClient.get<AuthUser>("/auth/me");
    return data;
  },
};
