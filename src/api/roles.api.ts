import { apiClient } from "./client";
import type {
  Role,
  Permission,
  CreateRolePayload,
  UpdateRolePayload,
  AssignRolePayload,
} from "@/types/role.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const rolesApi = {
  async getRoles(): Promise<Role[]> {
    const { data: response } = await apiClient.get<ApiResponse<Role[]>>("/roles");
    return response.data;
  },

  async getPermissions(): Promise<Permission[]> {
    const { data: response } = await apiClient.get<ApiResponse<Permission[]>>("/permissions");
    return response.data;
  },

  async createRole(payload: CreateRolePayload): Promise<Role> {
    const { data: response } = await apiClient.post<ApiResponse<Role>>("/roles", payload);
    return response.data;
  },

  async updateRole(
    id: number | string,
    payload: UpdateRolePayload,
  ): Promise<Role> {
    const { data: response } = await apiClient.patch<ApiResponse<Role>>(`/roles/${id}`, payload);
    return response.data;
  },

  async deleteRole(id: number | string): Promise<void> {
    await apiClient.delete(`/roles/${id}`);
  },

  async assignRole(payload: AssignRolePayload): Promise<void> {
    await apiClient.post("/roles/assign", payload);
  },

  async revokeRole(payload: AssignRolePayload): Promise<void> {
    await apiClient.post("/roles/revoke", payload);
  },
};
