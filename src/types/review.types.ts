// src/types/review.types.ts

export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  title?: string;
  comment?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  product: {
    id: number;
    name: string;
  };
}

export interface ReviewQuery {
  page?: number;
  limit?: number;
}
