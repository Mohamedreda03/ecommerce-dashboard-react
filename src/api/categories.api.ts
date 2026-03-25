import { apiClient } from "./client";
import type { Category, CreateCategoryPayload } from "@/types/category.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const categoriesApi = {
  async getCategories(): Promise<Category[]> {
    const { data: response } = await apiClient.get<ApiResponse<Category[]>>("/categories");
    return response.data;
  },

  async getCategoriesAdmin(): Promise<Category[]> {
    const { data: response } = await apiClient.get<ApiResponse<Category[]>>("/categories");
    return response.data;
  },

  async getCategoryById(id: number | string): Promise<Category> {
    const { data: response } = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  },

  async createCategory(payload: CreateCategoryPayload): Promise<Category> {
    const { data: response } = await apiClient.post<ApiResponse<Category>>("/categories", payload);
    return response.data;
  },

  async updateCategory(
    id: number | string,
    payload: Partial<CreateCategoryPayload>,
  ): Promise<Category> {
    const { data: response } = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, payload);
    return response.data;
  },

  async deleteCategory(id: number | string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },

  async restoreCategory(id: number | string): Promise<Category> {
    const { data: response } = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}/restore`);
    return response.data;
  },
};
