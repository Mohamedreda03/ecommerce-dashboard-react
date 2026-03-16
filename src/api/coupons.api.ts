import { apiClient } from "./client";
import type { PaginatedResponse } from "@/types/api.types";
import type { Coupon, CreateCouponPayload } from "@/types/coupon.types";

export const couponsApi = {
  async getCoupons(
    params?: Record<string, any>,
  ): Promise<PaginatedResponse<Coupon>> {
    const { data } = await apiClient.get<PaginatedResponse<Coupon>>(
      "/coupons",
      { params },
    );
    return data;
  },

  async getCouponById(id: number | string): Promise<Coupon> {
    const { data } = await apiClient.get<Coupon>(`/coupons/${id}`);
    return data;
  },

  async createCoupon(payload: CreateCouponPayload): Promise<Coupon> {
    const { data } = await apiClient.post<Coupon>("/coupons", payload);
    return data;
  },

  async updateCoupon(
    id: number | string,
    payload: Partial<CreateCouponPayload>,
  ): Promise<Coupon> {
    const { data } = await apiClient.patch<Coupon>(`/coupons/${id}`, payload);
    return data;
  },

  async deleteCoupon(id: number | string): Promise<void> {
    await apiClient.delete(`/coupons/${id}`);
  },
};
