import { apiClient } from "./client";
import type { Category, CreateCategoryPayload } from "@/types/category.types";

export const categoriesApi = {
  async getCategoriesAdmin(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>("/categories/admin");
    return data;
  },

  async createCategory(payload: CreateCategoryPayload): Promise<Category> {
    const { data } = await apiClient.post<Category>("/categories", payload);
    return data;
  },

  async updateCategory(
    id: number | string,
    payload: Partial<CreateCategoryPayload>,
  ): Promise<Category> {
    const { data } = await apiClient.patch<Category>(
      `/categories/${id}`,
      payload,
    );
    return data;
  },

  async deleteCategory(id: number | string, force?: boolean): Promise<void> {
    await apiClient.delete(`/categories/${id}`, { params: { force } });
  },
};
