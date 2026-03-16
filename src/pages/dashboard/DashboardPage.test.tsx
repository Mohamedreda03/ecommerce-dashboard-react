import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./DashboardPage";
import { useAuthStore } from "@/stores/auth.store";
import PermissionGuard from "@/router/PermissionGuard"; // router level guard

// Mock recharts to avoid rendering SVGs in JSDOM which could be heavy/unreliable
vi.mock("recharts", async () => {
  const OriginalModule = await vi.importActual("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => (
      <div data-testid="recharts-container">{children}</div>
    ),
    BarChart: ({ data }: any) => (
      <div data-testid="bar-chart">
        {data.map((d: any) => (
          <div key={d.name} data-testid={"bar-" + d.name}>
            {d.count}
          </div>
        ))}
      </div>
    ),
  };
});

describe("Phase 9: Dashboard Home", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    useAuthStore.setState({ user: null, accessToken: null, isHydrated: true });
  });

  const setup = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  it("Stats cards render correct values from MSW-mocked GET /orders/admin/stats response", async () => {
    // Set admin user to pass inner PermissionGuard
    useAuthStore.setState({
      user: {
        id: 1,
        email: "admin@example.com",
        roles: ["ADMIN"],
        permissions: ["read:analytics"],
      } as any,
    });
    setup();

    expect(
      await screen.findByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("150")).toBeInTheDocument();
    });
    expect(screen.getByText("$12,500.50")).toBeInTheDocument();
    expect(screen.getByText("$83.33")).toBeInTheDocument();
    // There may be multiple elements with the same numeric value (chart + card),
    // assert that at least one exists rather than relying on a unique match.
    expect(screen.getAllByText("100").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/10 pending, 5 processing/i)).toBeInTheDocument();
  });

  it("Recharts BarChart renders bars for each key in ordersByStatus", async () => {
    useAuthStore.setState({
      user: {
        id: 1,
        email: "admin@example.com",
        roles: ["ADMIN"],
        permissions: ["read:analytics"],
      } as any,
    });
    setup();

    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
    expect(screen.getByTestId("bar-PENDING")).toHaveTextContent("10");
    expect(screen.getByTestId("bar-DELIVERED")).toHaveTextContent("100");
    expect(screen.getByTestId("bar-SHIPPED")).toHaveTextContent("25");
    expect(screen.getByTestId("bar-PROCESSING")).toHaveTextContent("5");
    expect(screen.getByTestId("bar-CANCELLED")).toHaveTextContent("10");
  });

  it("Recent Orders table renders rows with correct orderNumber and status from recentOrders", async () => {
    useAuthStore.setState({
      user: {
        id: 1,
        email: "admin@example.com",
        roles: ["ADMIN"],
        permissions: ["read:analytics"],
      } as any,
    });
    setup();

    await waitFor(() => {
      expect(screen.getByText("ORD-001")).toBeInTheDocument();
    });
    expect(screen.getByText("DELIVERED")).toBeInTheDocument();
    expect(screen.getByText("ORD-002")).toBeInTheDocument();
    expect(screen.getByText("SHIPPED")).toBeInTheDocument();
  });

  it("User with only CUSTOMER permissions is redirected to /forbidden when navigating to /", async () => {
    useAuthStore.setState({
      user: {
        id: 2,
        email: "cust@example.com",
        roles: ["CUSTOMER"],
        permissions: ["read:own_orders"],
      } as any,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route
              path="/"
              element={
                <PermissionGuard permission="read:analytics">
                  <DashboardPage />
                </PermissionGuard>
              }
            />
            <Route path="/forbidden" element={<div>Forbidden Page</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Forbidden Page")).toBeInTheDocument();
    });
  });
});
