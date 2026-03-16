// src/types/role.types.ts

export interface Permission {
  id: number;
  action: string;
  subject: string;
  description?: string;
}

export interface RolePermission {
  permission: Permission;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  permissions: RolePermission[];
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissionIds?: number[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissionIds?: number[];
}

export interface AssignRolePayload {
  userId: number;
  roleId: number;
}
