import { apiClient } from "./client";
import type {
  Role,
  Permission,
  CreateRolePayload,
  UpdateRolePayload,
  AssignRolePayload,
} from "@/types/role.types";

export const rolesApi = {
  async getRoles(): Promise<Role[]> {
    const { data } = await apiClient.get<Role[]>("/roles");
    return data;
  },

  async getPermissions(): Promise<Permission[]> {
    const { data } = await apiClient.get<Permission[]>("/permissions");
    return data;
  },

  async createRole(payload: CreateRolePayload): Promise<Role> {
    const { data } = await apiClient.post<Role>("/roles", payload);
    return data;
  },

  async updateRole(
    id: number | string,
    payload: UpdateRolePayload,
  ): Promise<Role> {
    const { data } = await apiClient.patch<Role>(`/roles/${id}`, payload);
    return data;
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
