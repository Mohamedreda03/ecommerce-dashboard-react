import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { http, HttpResponse } from "msw";

import OrdersPage from "./OrdersPage";
import OrderDetailPage from "./OrderDetailPage";
import { server } from "@/test/mocks/server";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderOrdersList() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/orders"]}>
        <Routes>
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<div>Order Detail Route</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function renderOrderDetail(initialEntry = "/orders/1") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/orders" element={<div>Orders Route</div>} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Phase 14: Orders Management", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: 1,
        email: "admin@example.com",
        roles: ["ADMIN"],
        permissions: ["read:order", "update:order"],
      },
      accessToken: "mock-access-token",
      isHydrated: true,
    });
  });

  it("Selecting status=SHIPPED in the filter toolbar updates the GET /orders/admin query param", async () => {
    const user = userEvent.setup();
    let statusParam: string | null = null;

    server.use(
      http.get("*/orders/admin", ({ request }) => {
        statusParam = new URL(request.url).searchParams.get("status");
        return HttpResponse.json({
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
      }),
    );

    renderOrdersList();

    await waitFor(() => {
      expect(statusParam).toBeNull();
    });

    await user.selectOptions(screen.getByLabelText("Status"), "SHIPPED");

    await waitFor(() => {
      expect(statusParam).toBe("SHIPPED");
    });
  });

  it("Date range pickers pass ISO dateFrom and dateTo strings to the API request", async () => {
    const user = userEvent.setup();
    let dateFromParam: string | null = null;
    let dateToParam: string | null = null;

    server.use(
      http.get("*/orders/admin", ({ request }) => {
        const url = new URL(request.url);
        dateFromParam = url.searchParams.get("dateFrom");
        dateToParam = url.searchParams.get("dateTo");
        return HttpResponse.json({
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
      }),
    );

    renderOrdersList();

    fireEvent.change(screen.getByLabelText("Date from"), {
      target: { value: "2024-03-01" },
    });
    fireEvent.change(screen.getByLabelText("Date to"), {
      target: { value: "2024-03-31" },
    });

    await waitFor(() => {
      expect(dateFromParam).toBe("2024-03-01");
      expect(dateToParam).toBe("2024-03-31");
    });
  });

  it("Order detail page renders the items table, shipping address snapshot, and payment status card", async () => {
    renderOrderDetail();

    expect(await screen.findByText("Order Header")).toBeInTheDocument();
    expect(screen.getByText("Items")).toBeInTheDocument();
    expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
    expect(screen.getByText("Shipping Address")).toBeInTheDocument();
    expect(screen.getAllByText("123 Market Street").length).toBeGreaterThan(0);
    expect(screen.getByText("Payment Status")).toBeInTheDocument();
    expect(screen.getByText(/pi_12345/)).toBeInTheDocument();
  });

  it("Status update select shows only the valid next statuses for the current order status", async () => {
    renderOrderDetail();

    const select = (await screen.findByLabelText("Next status")) as HTMLSelectElement;
    const options = within(select).getAllByRole("option");
    const enabledValues = options
      .filter((option) => !option.hasAttribute("disabled") && option.getAttribute("value"))
      .map((option) => option.getAttribute("value"));

    expect(enabledValues).toEqual(["CONFIRMED", "CANCELLED"]);
  });

  it("Options for invalid transitions are rendered as disabled select options", async () => {
    renderOrderDetail("/orders/2");

    const select = (await screen.findByLabelText("Next status")) as HTMLSelectElement;

    expect(within(select).getByRole("option", { name: "DELIVERED" })).not.toBeDisabled();
    expect(within(select).getByRole("option", { name: "CANCELLED" })).not.toBeDisabled();
    expect(within(select).getByRole("option", { name: "CONFIRMED" })).toBeDisabled();
    expect(within(select).getByRole("option", { name: "PROCESSING" })).toBeDisabled();
    expect(within(select).getByRole("option", { name: "SHIPPED" })).toBeDisabled();
    expect(within(select).getByRole("option", { name: "REFUNDED" })).toBeDisabled();
  });
});
