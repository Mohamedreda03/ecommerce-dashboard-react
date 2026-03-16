// src/types/order.types.ts

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface Payment {
  id: number;
  status: string;
  provider: string;
  transactionId?: string;
}

export interface AddressSnapshot {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: OrderStatus;
  subtotalAmount: string;
  shippingAmount: string;
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  shippingAddressSnapshot: AddressSnapshot;
  billingAddressSnapshot: AddressSnapshot;
  couponId?: number;
  notes?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payment: Payment | null;
  coupon: {
    id: number;
    code: string;
    discountType: string;
    discountValue: string;
  } | null;
  user: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: string;
  ordersByStatus: Record<string, number>;
  averageOrderValue: string;
  recentOrders: Order[];
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}
