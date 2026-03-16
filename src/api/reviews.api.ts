import { apiClient } from "./client";
import type { PaginatedResponse } from "@/types/api.types";
import type { Review, ReviewQuery } from "@/types/review.types";

export const reviewsApi = {
  async getPendingReviews(
    params?: ReviewQuery,
  ): Promise<PaginatedResponse<Review>> {
    const { data } = await apiClient.get<PaginatedResponse<Review>>(
      "/reviews/pending",
      { params },
    );
    return data;
  },

  async approveReview(id: number | string): Promise<Review> {
    const { data } = await apiClient.patch<Review>(`/reviews/${id}/approve`);
    return data;
  },

  async rejectReview(id: number | string): Promise<Review> {
    const { data } = await apiClient.patch<Review>(`/reviews/${id}/reject`);
    return data;
  },

  async adminDeleteReview(id: number | string): Promise<void> {
    await apiClient.delete(`/reviews/admin/${id}`);
  },
};
