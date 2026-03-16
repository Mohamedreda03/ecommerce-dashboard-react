import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/api/products.api";
import type {
  CreateProductPayload,
  ProductQuery,
  UpdateStockPayload,
} from "@/types/product.types";

export const productKeys = {
  all: ["products"] as const,
  adminAll: () => [...productKeys.all, "admin"] as const,
  lists: () => [...productKeys.adminAll(), "list"] as const,
  list: (filters: ProductQuery) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

export function useProductsAdmin(query: ProductQuery) {
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn: () => productsApi.getProductsAdmin(query),
  });
}

export function useProductAdmin(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProductById(id),
    staleTime: 1000 * 60, // 60s
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductPayload) => productsApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateProductPayload>;
    }) => productsApi.updateProduct(id, data),
    onSuccess: (updatedProduct, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsApi.softDeleteProduct(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsApi.restoreProduct(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStockPayload }) =>
      productsApi.updateStock(id, data),
    onSuccess: (updatedProduct, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
    },
  });
}

export function useAddImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        images: Array<{ url: string; alt?: string; sortOrder?: number }>;
      };
    }) => productsApi.addProductImages(id, data),
    onSuccess: (updatedProduct, { id }) => {
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
    },
  });
}

export function useReorderImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { imageIds: number[] } }) =>
      productsApi.reorderImages(id, data),
    onSuccess: (updatedProduct, { id }) => {
      queryClient.setQueryData(productKeys.detail(id), updatedProduct);
    },
  });
}

export function useRemoveImage() {
  const queryClient = useQueryClient();
  return useMutation({
    // We expect both productId and imageId to be able to invalidate correctly, though API only needs imageId
    mutationFn: ({ imageId }: { productId: number; imageId: number }) =>
      productsApi.removeImage(imageId),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(productId),
      });
    },
  });
}
