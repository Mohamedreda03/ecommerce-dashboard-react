// src/types/auth.types.ts

export interface AuthRole {
  role: {
    id?: number;
    name: string;
  };
}

export interface AuthUser {
  id: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: AuthRole[];
  permissions?: string[]; // permissions come from the JWT if not directly on the user object
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}
