import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/api/categories.api";
import type { CreateCategoryPayload } from "@/types/category.types";

export const categoryKeys = {
  all: ["categories"] as const,
  admin: () => [...categoryKeys.all, "admin"] as const,
};

export function useCategoriesAdmin() {
  return useQuery({
    queryKey: categoryKeys.admin(),
    queryFn: () => categoriesApi.getCategoriesAdmin(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryPayload) =>
      categoriesApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.admin() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateCategoryPayload>;
    }) => categoriesApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.admin() });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, force }: { id: number; force?: boolean }) =>
      categoriesApi.deleteCategory(id, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.admin() });
    },
  });
}
