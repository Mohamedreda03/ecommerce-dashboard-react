import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/test/mocks/server";
import { useUsers, useCreateUser } from "./use-users";
import { useLogin } from "./use-auth";
import { usePermissions } from "./use-roles";
import { useAuthStore } from "@/stores/auth.store";

// Setup query client for tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const wrapper = ({ children }: { children: ReactNode }) => {
  const testQueryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe("React Query Hooks", () => {
  beforeEach(() => {
    // Provide a mocked token so our api client and MSW handlers authenticate
    useAuthStore.setState({
      accessToken: "mock-access-token",
      user: {
        id: 1,
        email: "admin@example.com",
        roles: ["ADMIN"],
        permissions: ["manage:all"],
      },
      isHydrated: true,
    });
  });

  it("useUsers returns mapped paginated data", async () => {
    const { result } = renderHook(() => useUsers({ page: 1, limit: 10 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toBeInstanceOf(Array);
    expect(result.current.data?.data[0]).toHaveProperty(
      "email",
      "admin@example.com",
    );
    expect(result.current.data?.meta).toHaveProperty("total", 2);
  });

  it("useCreateUser invalidates users list on success", async () => {
    const testQueryClient = createTestQueryClient();
    const customWrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    );

    const invalidateSpy = vi.spyOn(testQueryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateUser(), {
      wrapper: customWrapper,
    });

    result.current.mutate({
      email: "new@example.com",
      password: "password",
      firstName: "New",
      lastName: "User",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: expect.arrayContaining(["users", "list"]),
    });
  });

  it("useLogin stores user and accessToken in Zustand", async () => {
    useAuthStore.setState({ user: null, accessToken: null });

    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ email: "admin@example.com", password: "password" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const storeState = useAuthStore.getState();
    expect(storeState.accessToken).toBe("mock-access-token");
    expect(storeState.user?.email).toBe("admin@example.com");
  });

  it("usePermissions returns permission list", async () => {
    const { result } = renderHook(() => usePermissions(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeInstanceOf(Array);
    expect(result.current.data?.[0]).toHaveProperty("action", "manage");
    expect(result.current.data?.[0]).toHaveProperty("subject", "all");
  });

  it("handles 500 without crashing and sets isError", async () => {
    // Override MSW for this test to force 500 error
    server.use(
      http.get("*/users", () => {
        return HttpResponse.json(
          { message: "Internal Server Error" },
          { status: 500 },
        );
      }),
    );

    const { result } = renderHook(() => useUsers({ page: 1 }), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
    expect(result.current.isSuccess).toBe(false);
  });
});
