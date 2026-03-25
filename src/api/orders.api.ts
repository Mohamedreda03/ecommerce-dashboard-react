import { apiClient } from "./client";
import type { PaginatedResponse } from "@/types/api.types";
import type {
  Order,
  OrdersAdminQuery,
  OrderStats,
  UpdateOrderStatusPayload,
} from "@/types/order.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const ordersApi = {
  async getOrdersAdmin(
    params?: OrdersAdminQuery,
  ): Promise<PaginatedResponse<Order>> {
    const { data: response } = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>(
      "/orders/admin",
      { params },
    );
    return response.data;
  },

  async getOrderStats(): Promise<OrderStats> {
    const { data: response } = await apiClient.get<ApiResponse<OrderStats>>("/orders/admin/stats");
    return response.data;
  },

  async getOrderById(id: number | string): Promise<Order> {
    const { data: response } = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(
    id: number | string,
    payload: UpdateOrderStatusPayload,
  ): Promise<Order> {
    const { data: response } = await apiClient.patch<ApiResponse<Order>>(
      `/orders/${id}/status`,
      payload,
    );
    return response.data;
  },
};
