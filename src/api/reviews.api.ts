import { apiClient } from "./client";
import type { PaginatedResponse } from "@/types/api.types";
import type { Review, ReviewQuery } from "@/types/review.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export const reviewsApi = {
  async getReviews(params?: ReviewQuery): Promise<PaginatedResponse<Review>> {
    const { data: response } = await apiClient.get<ApiResponse<PaginatedResponse<Review>>>("/reviews", {
      params,
    });
    return response.data;
  },

  async getReviewById(id: number | string): Promise<Review> {
    const { data: response } = await apiClient.get<ApiResponse<Review>>(`/reviews/${id}`);
    return response.data;
  },

  async deleteReview(id: number | string): Promise<void> {
    await apiClient.delete(`/reviews/${id}`);
  },

  async restoreReview(id: number | string): Promise<Review> {
    const { data: response } = await apiClient.patch<ApiResponse<Review>>(`/reviews/${id}/restore`);
    return response.data;
  },
};
