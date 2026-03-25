import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponsApi } from "@/api/coupons.api";
import type { CouponQuery, CreateCouponPayload } from "@/types/coupon.types";

export const couponKeys = {
  all: ["coupons"] as const,
  lists: () => [...couponKeys.all, "list"] as const,
  list: (filters: CouponQuery) => [...couponKeys.lists(), filters] as const,
  details: () => [...couponKeys.all, "detail"] as const,  detail: (id: number) => [...couponKeys.details(), id] as const,
};

export function useCoupons(query: CouponQuery) {
  return useQuery({
    queryKey: couponKeys.list(query),
    queryFn: () => couponsApi.getCoupons(query),
  });
}

export function useCoupon(id: number) {
  return useQuery({
    queryKey: couponKeys.detail(id),
    queryFn: () => couponsApi.getCouponById(id),
    staleTime: 1000 * 60,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCouponPayload) => couponsApi.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateCouponPayload>;
    }) => couponsApi.updateCoupon(id, data),
    onSuccess: (updatedCoupon, { id }) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.setQueryData(couponKeys.detail(id), updatedCoupon);
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => couponsApi.deleteCoupon(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: couponKeys.detail(id) });
    },
  });
}
