import { describe, it, expect } from "vitest";
import { OrderStatus } from "./order.types";
import type { PaginatedResponse } from "./api.types";
import type { UserSafe } from "./user.types";

describe("Types Phase 2", () => {
  describe("OrderStatus Enum", () => {
    it("contains all 7 required values", () => {
      expect(OrderStatus.PENDING).toBe("PENDING");
      expect(OrderStatus.CONFIRMED).toBe("CONFIRMED");
      expect(OrderStatus.PROCESSING).toBe("PROCESSING");
      expect(OrderStatus.SHIPPED).toBe("SHIPPED");
      expect(OrderStatus.DELIVERED).toBe("DELIVERED");
      expect(OrderStatus.CANCELLED).toBe("CANCELLED");
      expect(OrderStatus.REFUNDED).toBe("REFUNDED");

      const keys = Object.keys(OrderStatus);
      expect(keys.length).toBe(7);
    });
  });

  describe("PaginatedResponse<UserSafe>", () => {
    it("correctly narrows data to UserSafe[] and meta to PaginationMeta", () => {
      // TypeScript compiler test via exact assignment
      const mockResponse: PaginatedResponse<UserSafe> = {
        data: [
          {
            id: 1,
            email: "test@example.com",
            isActive: true,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
            roles: [],
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      expect(mockResponse.data[0].email).toBe("test@example.com");
      expect(mockResponse.meta.page).toBe(1);
    });
  });
});
