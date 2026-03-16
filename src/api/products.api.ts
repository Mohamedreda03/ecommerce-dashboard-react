import { apiClient } from "./client";
import type { PaginatedResponse } from "@/types/api.types";
import type {
  Product,
  CreateProductPayload,
  ProductQuery,
  UpdateStockPayload,
} from "@/types/product.types";

// Note: Ensure types for `ProductQuery` correctly define `Record<string, any>` compatibility
// or use `any` here if specific typing isn't 100% matched strictly.
export const productsApi = {
  async getProductsAdmin(
    params?: ProductQuery,
  ): Promise<PaginatedResponse<Product>> {
    const { data } = await apiClient.get<PaginatedResponse<Product>>(
      "/products/admin/all",
      { params },
    );
    return data;
  },

  async getProductById(id: number | string): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },

  async createProduct(payload: CreateProductPayload): Promise<Product> {
    const { data } = await apiClient.post<Product>("/products", payload);
    return data;
  },

  async updateProduct(
    id: number | string,
    payload: Partial<CreateProductPayload>,
  ): Promise<Product> {
    const { data } = await apiClient.patch<Product>(`/products/${id}`, payload);
    return data;
  },

  async updateStock(
    id: number | string,
    payload: UpdateStockPayload,
  ): Promise<Product> {
    const { data } = await apiClient.patch<Product>(
      `/products/${id}/stock`,
      payload,
    );
    return data;
  },

  async softDeleteProduct(id: number | string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async restoreProduct(id: number | string): Promise<Product> {
    const { data } = await apiClient.patch<Product>(`/products/${id}/restore`);
    return data;
  },

  async addProductImages(
    id: number | string,
    payload: { images: { url: string; alt?: string; sortOrder?: number }[] },
  ): Promise<Product> {
    const { data } = await apiClient.post<Product>(
      `/products/${id}/images`,
      payload,
    );
    return data;
  },

  async reorderImages(
    id: number | string,
    payload: { imageIds: number[] },
  ): Promise<Product> {
    const { data } = await apiClient.patch<Product>(
      `/products/${id}/images/reorder`,
      payload,
    );
    return data;
  },

  async removeImage(imageId: number | string): Promise<void> {
    await apiClient.delete(`/products/images/${imageId}`);
  },
};
