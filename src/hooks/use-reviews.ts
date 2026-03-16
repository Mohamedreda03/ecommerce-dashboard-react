import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "@/api/reviews.api";
import type { ReviewQuery } from "@/types/review.types";

export const reviewKeys = {
  all: ["reviews"] as const,
  pending: () => [...reviewKeys.all, "pending"] as const,
  pendingList: (filters: ReviewQuery) =>
    [...reviewKeys.pending(), filters] as const,
};

export function usePendingReviews(query: ReviewQuery) {
  return useQuery({
    queryKey: reviewKeys.pendingList(query),
    queryFn: () => reviewsApi.getPendingReviews(query),
  });
}

export function useApproveReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewsApi.approveReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.pending() });
    },
  });
}

export function useRejectReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewsApi.rejectReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.pending() });
    },
  });
}

export function useAdminDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewsApi.adminDeleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.pending() });
    },
  });
}
