// src/types/product.types.ts

export interface ProductImage {
  id: number;
  url: string;
  alt?: string;
  sortOrder?: number;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  compareAtPrice?: string;
  costPrice?: string;
  stock: number;
  lowStockThreshold: number;
  weight?: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId?: number;
  images: ProductImage[];
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  name: string;
  price: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  compareAtPrice?: string;
  costPrice?: string;
  stock?: number;
  lowStockThreshold?: number;
  weight?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  categoryId?: number;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  minPrice?: string;
  maxPrice?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface UpdateStockPayload {
  quantity: number;
  operation: "set" | "increment" | "decrement";
}
