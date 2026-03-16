// src/types/auth.types.ts

export interface AuthUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}
