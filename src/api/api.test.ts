import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { authApi } from "./auth.api";
import { usersApi } from "./users.api";
import { ordersApi } from "./orders.api";
import { useAuthStore } from "@/stores/auth.store";
import { baseURL } from "./client";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";
import { OrderStatus } from "@/types/order.types";

describe("API Layer", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe("Interceptors", () => {
    it("attaches Authorization header when token exists", async () => {
      useAuthStore.getState().setTokens("test-token");

      server.use(
        http.get(`${baseURL}/users`, ({ request }) => {
          expect(request.headers.get("Authorization")).toBe(
            "Bearer test-token",
          );
          return HttpResponse.json({ data: [], meta: {} });
        }),
      );

      await usersApi.getUsers();
    });

    it("handles 401 refresh flow successfully", async () => {
      let retryCount = 0;
      useAuthStore.getState().setTokens("expired-token");

      server.use(
        http.get(`${baseURL}/users/1`, () => {
          if (retryCount === 0) {
            retryCount++;
            return new HttpResponse(null, { status: 401 });
          }
          return HttpResponse.json({ id: 1, email: "test@test.com" });
        }),
        http.post(`${baseURL}/auth/refresh`, () => {
          return HttpResponse.json({ accessToken: "new-token" });
        }),
      );

      const result = await usersApi.getUserById(1);
      expect(result.email).toBe("test@test.com");
      expect(useAuthStore.getState().accessToken).toBe("new-token");
    });
  });

  describe("API Functions", () => {
    it("login sends payload and returns correct types", async () => {
      const response = await authApi.login({
        email: "admin@example.com",
        password: "password123",
      });
      expect(response.user.email).toBe("admin@example.com");
      expect(response.accessToken).toBe("mock-access-token");
    });

    it("updateOrderStatus calls patch with correct body", async () => {
      server.use(
        http.patch(`${baseURL}/orders/1/status`, async ({ request }) => {
          const body = (await request.json()) as any;
          expect(body.status).toBe(OrderStatus.SHIPPED);
          return HttpResponse.json({ id: 1, status: OrderStatus.SHIPPED });
        }),
      );

      const response = await ordersApi.updateOrderStatus(1, {
        status: OrderStatus.SHIPPED,
      });
      expect(response.status).toBe(OrderStatus.SHIPPED);
    });

    it("surfaces a structured error object on non-2xx responses", async () => {
      server.use(
        http.post(`${baseURL}/users`, () => {
          return HttpResponse.json(
            { message: "Validation failed", statusCode: 400 },
            { status: 400 },
          );
        }),
      );

      await expect(usersApi.createUser({ email: "bad" })).rejects.toEqual({
        message: "Validation failed",
        statusCode: 400,
      });
    });
  });
});
