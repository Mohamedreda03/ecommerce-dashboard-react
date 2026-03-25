import { apiClient } from "./client";
import type { PaginatedResponse } from "@/types/api.types";
import type {
  UserSafe,
  CreateUserPayload,
  UpdateUserPayload,
  UserQuery,
} from "@/types/user.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const usersApi = {
  async getUsers(
    params?: UserQuery,
  ): Promise<PaginatedResponse<UserSafe>> {
    const { data: response } = await apiClient.get<ApiResponse<PaginatedResponse<UserSafe>>>(
      "/users",
      { params },
    );
    return response.data;
  },

  async getUserById(id: number | string): Promise<UserSafe> {
    const { data: response } = await apiClient.get<ApiResponse<UserSafe>>(`/users/${id}`);
    return response.data;
  },

  async createUser(payload: CreateUserPayload): Promise<UserSafe> {
    const { data: response } = await apiClient.post<ApiResponse<UserSafe>>("/users", payload);
    return response.data;
  },

  async updateUser(
    id: number | string,
    payload: UpdateUserPayload,
  ): Promise<UserSafe> {
    const { data: response } = await apiClient.patch<ApiResponse<UserSafe>>(`/users/${id}`, payload);
    return response.data;
  },

  async softDeleteUser(id: number | string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async restoreUser(id: number | string): Promise<UserSafe> {
    const { data: response } = await apiClient.patch<ApiResponse<UserSafe>>(`/users/${id}/restore`);
    return response.data;
  },
};
