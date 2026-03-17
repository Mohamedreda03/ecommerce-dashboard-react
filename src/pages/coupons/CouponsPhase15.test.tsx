import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { toast } from "sonner";

import CouponsPage from "./CouponsPage";
import { server } from "@/test/mocks/server";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderCouponsPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CouponsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Phase 15: Coupons Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 1,
        email: "admin@example.com",
        roles: ["ADMIN"],
        permissions: [
          "read:coupon",
          "create:coupon",
          "update:coupon",
          "delete:coupon",
        ],
      },
      accessToken: "mock-access-token",
      isHydrated: true,
    });
  });

  it("Coupon form validates that discountValue is a non-empty decimal string", async () => {
    const user = userEvent.setup();
    renderCouponsPage();

    await screen.findByText("SPRING15");
    await user.click(screen.getByRole("button", { name: "New Coupon" }));
    await user.type(screen.getByLabelText("Code"), "SAVE10");
    await user.click(screen.getByRole("button", { name: "Create Coupon" }));

    expect(await screen.findByText("Must be a valid decimal value")).toBeInTheDocument();
  });

  it("Selecting PERCENTAGE type reveals the maxDiscountAmount field and FIXED_AMOUNT hides it", async () => {
    const user = userEvent.setup();
    renderCouponsPage();

    await screen.findByText("SPRING15");
    await user.click(screen.getByRole("button", { name: "New Coupon" }));

    expect(screen.getByLabelText("Maximum Discount Amount")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "FIXED_AMOUNT" }));
    expect(screen.queryByLabelText("Maximum Discount Amount")).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "PERCENTAGE" }));
    expect(screen.getByLabelText("Maximum Discount Amount")).toBeInTheDocument();
  });

  it("expiresAt calendar disables dates earlier than the selected startsAt value", async () => {
    const user = userEvent.setup();
    renderCouponsPage();

    await screen.findByText("SPRING15");
    await user.click(screen.getByRole("button", { name: "New Coupon" }));

    await user.click(screen.getByRole("button", { name: /Select start date/i }));
    const startPopover = document.querySelector('[data-slot="popover-content"]') as HTMLElement;
    const startDay = within(startPopover)
      .getAllByRole("button")
      .find((button) => button.textContent === "10") as HTMLButtonElement;
    await user.click(startDay);

    await user.click(screen.getByRole("button", { name: /Select expiry date/i }));
    const expiryPopover = document.querySelector('[data-slot="popover-content"]') as HTMLElement;
    const earlierDay = within(expiryPopover)
      .getAllByRole("button")
      .find((button) => button.textContent === "9") as HTMLButtonElement;

    expect(earlierDay).toBeDisabled();
  });

  it("Submitting the create form posts POST /coupons with correct decimal string values", async () => {
    const user = userEvent.setup();
    let requestBody: unknown;

    server.use(
      http.post("*/coupons", async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(
          {
            id: 77,
            currentUses: 0,
            createdAt: "2024-03-20T00:00:00.000Z",
            updatedAt: "2024-03-20T00:00:00.000Z",
            ...(requestBody as Record<string, unknown>),
          },
          { status: 201 },
        );
      }),
    );

    renderCouponsPage();

    await screen.findByText("SPRING15");
    await user.click(screen.getByRole("button", { name: "New Coupon" }));

    await user.type(screen.getByLabelText("Code"), "save10");
    await user.type(screen.getByLabelText("Discount Value"), "12.5");
    await user.type(screen.getByLabelText("Minimum Order Amount"), "49.99");
    await user.type(screen.getByLabelText("Maximum Discount Amount"), "20.00");
    await user.type(screen.getByLabelText("Maximum Uses"), "25");
    await user.type(screen.getByLabelText("Description"), "Seasonal offer");

    await user.click(screen.getByRole("button", { name: "Create Coupon" }));

    await waitFor(() => {
      expect(requestBody).toMatchObject({
        code: "SAVE10",
        discountType: "PERCENTAGE",
        discountValue: "12.5",
        minOrderAmount: "49.99",
        maxDiscountAmount: "20.00",
        maxUses: 25,
        description: "Seasonal offer",
        isActive: true,
      });
    });
  });

  it("MSW returning 400 on delete shows an error toast and keeps the row", async () => {
    const user = userEvent.setup();

    server.use(
      http.delete("*/coupons/:id", () =>
        HttpResponse.json(
          { message: "Coupon is already in use", statusCode: 400 },
          { status: 400 },
        ),
      ),
    );

    renderCouponsPage();

    expect(await screen.findByText("SPRING15")).toBeInTheDocument();
    const springRow = screen.getByText("SPRING15").closest("tr") as HTMLElement;
    await user.click(within(springRow).getByRole("button", { name: "Delete" }));
    await user.click(await screen.findByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Coupon is already in use");
    });
    expect(screen.getByText("SPRING15")).toBeInTheDocument();
  });
});
