import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "@/api/reviews.api";
import type { ReviewQuery } from "@/types/review.types";
import type { PaginatedResponse } from "@/types/api.types";
import type { Review } from "@/types/review.types";

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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: reviewKeys.pending() });

      const previousLists = queryClient.getQueriesData<PaginatedResponse<Review>>({
        queryKey: reviewKeys.pending(),
      });

      previousLists.forEach(([queryKey, data]) => {
        if (!data) return;

        queryClient.setQueryData(queryKey, {
          ...data,
          data: data.data.filter((review) => review.id !== id),
        });
      });

      return { previousLists };
    },
    onError: (_error, _id, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.pending() });
    },
  });
}

export function useRejectReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewsApi.rejectReview(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: reviewKeys.pending() });

      const previousLists = queryClient.getQueriesData<PaginatedResponse<Review>>({
        queryKey: reviewKeys.pending(),
      });

      previousLists.forEach(([queryKey, data]) => {
        if (!data) return;

        queryClient.setQueryData(queryKey, {
          ...data,
          data: data.data.filter((review) => review.id !== id),
        });
      });

      return { previousLists };
    },
    onError: (_error, _id, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.pending() });
    },
  });
}

export function useAdminDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewsApi.adminDeleteReview(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: reviewKeys.pending() });

      const previousLists = queryClient.getQueriesData<PaginatedResponse<Review>>({
        queryKey: reviewKeys.pending(),
      });

      previousLists.forEach(([queryKey, data]) => {
        if (!data) return;

        queryClient.setQueryData(queryKey, {
          ...data,
          data: data.data.filter((review) => review.id !== id),
        });
      });

      return { previousLists };
    },
    onError: (_error, _id, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.pending() });
    },
  });
}
