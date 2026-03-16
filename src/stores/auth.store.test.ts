import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "./auth.store";

describe("Auth Store", () => {
  beforeEach(() => {
    // Reset state and local storage before each test
    useAuthStore.setState({ user: null, accessToken: null, isHydrated: false });
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Permissions & Roles logic", () => {
    it("hasPermission returns true for manage:all user", () => {
      useAuthStore.setState({
        user: {
          id: 1,
          email: "test@t.com",
          roles: ["SUPER_ADMIN"],
          permissions: ["manage:all"],
        },
        isHydrated: true,
      });

      expect(useAuthStore.getState().hasPermission("read:user")).toBe(true);
      expect(useAuthStore.getState().hasPermission("some:made:up:rule")).toBe(
        true,
      );
    });

    it("hasPermission returns true when single permission matches exactly", () => {
      useAuthStore.setState({
        user: {
          id: 2,
          email: "admin@t.com",
          roles: ["ADMIN"],
          permissions: ["read:user", "update:user"],
        },
        isHydrated: true,
      });

      expect(useAuthStore.getState().hasPermission("read:user")).toBe(true);
      expect(useAuthStore.getState().hasPermission("update:user")).toBe(true);
      expect(useAuthStore.getState().hasPermission("delete:user")).toBe(false);
    });

    it("hasPermission returns false when no permissions match", () => {
      useAuthStore.setState({
        user: {
          id: 3,
          email: "customer@t.com",
          roles: ["CUSTOMER"],
          permissions: ["read:product"],
        },
        isHydrated: true,
      });

      expect(useAuthStore.getState().hasPermission("create:product")).toBe(
        false,
      );
    });

    it("isAdminUser returns false for purely customer roles", () => {
      useAuthStore.setState({
        user: {
          id: 4,
          email: "customer@t.com",
          roles: ["CUSTOMER"],
          permissions: ["read:product", "create:order"],
        },
        isHydrated: true,
      });
      expect(useAuthStore.getState().isAdminUser()).toBe(false);
    });

    it("isAdminUser returns true for mixed sets including generic action", () => {
      useAuthStore.setState({
        user: {
          id: 5,
          email: "staff@t.com",
          roles: ["CUSTOMER"],
          permissions: ["read:product", "read:analytics"],
        },
        isHydrated: true,
      });
      // Should match read:analytics as an admin permission
      expect(useAuthStore.getState().isAdminUser()).toBe(true);
    });
  });

  describe("Tokens and user resets", () => {
    it("sets access tokens and syncs it", () => {
      useAuthStore.getState().setTokens("token-123");
      expect(useAuthStore.getState().accessToken).toBe("token-123");
    });

    it("clearAuth wipes user and token from app store naturally", () => {
      useAuthStore.setState({
        accessToken: "super-token",
        user: { id: 1, email: "t", permissions: [], roles: [] },
        isHydrated: true,
      });

      useAuthStore.getState().clearAuth();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
  });
});
