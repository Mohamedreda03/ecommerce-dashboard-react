import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders.api";
import type { UpdateOrderStatusPayload } from "@/types/order.types";

export const orderKeys = {
  all: ["orders"] as const,
  adminAll: () => [...orderKeys.all, "admin"] as const,
  lists: () => [...orderKeys.adminAll(), "list"] as const,
  list: (filters: Record<string, any>) =>
    [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
  stats: () => [...orderKeys.adminAll(), "stats"] as const,
};

export function useOrdersAdmin(query: Record<string, any>) {
  return useQuery({
    queryKey: orderKeys.list(query),
    queryFn: () => ordersApi.getOrdersAdmin(query),
  });
}

export function useOrderStats() {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: () => ordersApi.getOrderStats(),
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getOrderById(id),
    staleTime: 1000 * 60, // 60s
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateOrderStatusPayload;
    }) => ordersApi.updateOrderStatus(id, data),
    onSuccess: (updatedOrder, { id }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
      queryClient.setQueryData(orderKeys.detail(id), updatedOrder);
    },
  });
}
