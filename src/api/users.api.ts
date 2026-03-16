import { apiClient } from "./client";
import type { PaginatedResponse } from "@/types/api.types";
import type {
  UserSafe,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/types/user.types";

export const usersApi = {
  async getUsers(
    params?: Record<string, any>,
  ): Promise<PaginatedResponse<UserSafe>> {
    const { data } = await apiClient.get<PaginatedResponse<UserSafe>>(
      "/users",
      { params },
    );
    return data;
  },

  async getUserById(id: number | string): Promise<UserSafe> {
    const { data } = await apiClient.get<UserSafe>(`/users/${id}`);
    return data;
  },

  async createUser(payload: CreateUserPayload): Promise<UserSafe> {
    const { data } = await apiClient.post<UserSafe>("/users", payload);
    return data;
  },

  async updateUser(
    id: number | string,
    payload: UpdateUserPayload,
  ): Promise<UserSafe> {
    const { data } = await apiClient.patch<UserSafe>(`/users/${id}`, payload);
    return data;
  },

  async softDeleteUser(id: number | string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async restoreUser(id: number | string): Promise<UserSafe> {
    const { data } = await apiClient.patch<UserSafe>(`/users/${id}/restore`);
    return data;
  },
};
