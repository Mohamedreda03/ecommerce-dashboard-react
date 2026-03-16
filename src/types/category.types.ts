// src/types/category.types.ts

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number | null;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  parentId?: number | null;
  image?: string;
  sortOrder?: number;
  isActive?: boolean;
}
