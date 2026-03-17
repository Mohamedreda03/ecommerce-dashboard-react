import { apiClient } from "./client";
import type { PaginatedResponse } from "@/types/api.types";
import type {
  Order,
  OrdersAdminQuery,
  OrderStats,
  UpdateOrderStatusPayload,
} from "@/types/order.types";

export const ordersApi = {
  async getOrdersAdmin(
    params?: OrdersAdminQuery,
  ): Promise<PaginatedResponse<Order>> {
    const { data } = await apiClient.get<PaginatedResponse<Order>>(
      "/orders/admin",
      { params },
    );
    return data;
  },

  async getOrderStats(): Promise<OrderStats> {
    const { data } = await apiClient.get<OrderStats>("/orders/admin/stats");
    return data;
  },

  async getOrderById(id: number | string): Promise<Order> {
    const { data } = await apiClient.get<Order>(`/orders/${id}`);
    return data;
  },

  async updateOrderStatus(
    id: number | string,
    payload: UpdateOrderStatusPayload,
  ): Promise<Order> {
    const { data } = await apiClient.patch<Order>(
      `/orders/${id}/status`,
      payload,
    );
    return data;
  },
};
