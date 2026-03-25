import { apiClient } from "./client";
import type { PaginatedResponse } from "@/types/api.types";
import type {
  Product,
  CreateProductPayload,
  ProductQuery,
  UpdateStockPayload,
} from "@/types/product.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const productsApi = {
  async getProductsAdmin(
    params?: ProductQuery,
  ): Promise<PaginatedResponse<Product>> {
    const { data: response } = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
      "/products",
      { params },
    );
    return response.data;
  },

  async getProductById(id: number | string): Promise<Product> {
    const { data: response } = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  async createProduct(payload: CreateProductPayload): Promise<Product> {
    const { data: response } = await apiClient.post<ApiResponse<Product>>("/products", payload);
    return response.data;
  },

  async updateProduct(
    id: number | string,
    payload: Partial<CreateProductPayload>,
  ): Promise<Product> {
    const { data: response } = await apiClient.patch<ApiResponse<Product>>(`/products/${id}`, payload);
    return response.data;
  },

  async updateStock(
    id: number | string,
    payload: UpdateStockPayload,
  ): Promise<Product> {
    const { data: response } = await apiClient.patch<ApiResponse<Product>>(
      `/products/${id}/stock`,
      payload,
    );
    return response.data;
  },

  async softDeleteProduct(id: number | string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async restoreProduct(id: number | string): Promise<Product> {
    const { data: response } = await apiClient.patch<ApiResponse<Product>>(`/products/${id}/restore`);
    return response.data;
  },

  async addProductImages(
    id: number | string,
    payload: { images: { url: string; alt?: string; sortOrder?: number }[] },
  ): Promise<Product> {
    const { data: response } = await apiClient.post<ApiResponse<Product>>(
      `/products/${id}/images`,
      payload,
    );
    return response.data;
  },

  async reorderImages(
    id: number | string,
    payload: { imageIds: number[] },
  ): Promise<Product> {
    const { data: response } = await apiClient.patch<ApiResponse<Product>>(
      `/products/${id}/images/reorder`,
      payload,
    );
    return response.data;
  },

  async removeImage(imageId: number | string): Promise<void> {
    await apiClient.delete(`/products/images/${imageId}`);
  },
};
