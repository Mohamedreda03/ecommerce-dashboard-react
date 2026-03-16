// src/types/user.types.ts

export interface UserRole {
  role: {
    id: number;
    name: string;
  };
}

export interface UserSafe {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
}

export interface CreateUserPayload {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId?: number;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  roleId?: number;
  password?: string;
}
