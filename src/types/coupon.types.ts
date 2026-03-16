// src/types/coupon.types.ts

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
}

export interface Coupon {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: string;
  description?: string;
  minOrderAmount?: string;
  maxDiscountAmount?: string;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
  startsAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponPayload {
  code: string;
  discountType: DiscountType;
  discountValue: string;
  description?: string;
  minOrderAmount?: string;
  maxDiscountAmount?: string;
  maxUses?: number;
  isActive?: boolean;
  startsAt?: string;
  expiresAt?: string;
}
