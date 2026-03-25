import { apiClient } from "./client";
import type { PaginatedResponse } from "@/types/api.types";
import type {
  Coupon,
  CouponQuery,
  CreateCouponPayload,
} from "@/types/coupon.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const couponsApi = {
  async getCoupons(params?: CouponQuery): Promise<PaginatedResponse<Coupon>> {
    const { data: response } = await apiClient.get<ApiResponse<PaginatedResponse<Coupon>>>("/coupons", {
      params,
    });
    return response.data;
  },

  async getCouponById(id: number | string): Promise<Coupon> {
    const { data: response } = await apiClient.get<ApiResponse<Coupon>>(`/coupons/${id}`);
    return response.data;
  },

  async createCoupon(payload: CreateCouponPayload): Promise<Coupon> {
    const { data: response } = await apiClient.post<ApiResponse<Coupon>>("/coupons", payload);
    return response.data;
  },

  async updateCoupon(
    id: number | string,
    payload: Partial<CreateCouponPayload>,
  ): Promise<Coupon> {
    const { data: response } = await apiClient.patch<ApiResponse<Coupon>>(`/coupons/${id}`, payload);
    return response.data;
  },

  async deleteCoupon(id: number | string): Promise<void> {
    await apiClient.delete(`/coupons/${id}`);
  },
};
