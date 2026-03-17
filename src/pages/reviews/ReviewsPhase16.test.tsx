import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse, delay } from "msw";

import ReviewsPage from "./ReviewsPage";
import { server } from "@/test/mocks/server";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderReviewsPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ReviewsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Phase 16: Reviews Moderation", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: 1,
        email: "admin@example.com",
        roles: ["ADMIN"],
        permissions: ["read:review", "update:review", "delete:review"],
      },
      accessToken: "mock-access-token",
      isHydrated: true,
    });
  });

  it("Pending reviews table renders rows from MSW GET /reviews/pending fixture", async () => {
    renderReviewsPage();

    expect(await screen.findByText("Wireless Headphones")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Excellent sound")).toBeInTheDocument();
  });

  it("Approving a review optimistically removes its row; MSW 500 response causes the row to reappear", async () => {
    const user = userEvent.setup();

    server.use(
      http.patch("*/reviews/:id/approve", async () => {
        await delay(100);
        return HttpResponse.json(
          { message: "Server error", statusCode: 500 },
          { status: 500 },
        );
      }),
    );

    renderReviewsPage();

    expect(await screen.findByText("Excellent sound")).toBeInTheDocument();
    const row = screen.getByText("Excellent sound").closest("tr") as HTMLElement;
    await user.click(within(row).getByRole("button", { name: "Approve" }));

    await waitFor(() => {
      expect(screen.queryByText("Excellent sound")).not.toBeInTheDocument();
    });

    expect(await screen.findByText("Excellent sound")).toBeInTheDocument();
  });

  it("Rejecting a review optimistically removes its row; MSW 500 response causes the row to reappear", async () => {
    const user = userEvent.setup();

    server.use(
      http.patch("*/reviews/:id/reject", async () => {
        await delay(100);
        return HttpResponse.json(
          { message: "Server error", statusCode: 500 },
          { status: 500 },
        );
      }),
    );

    renderReviewsPage();

    expect(await screen.findByText("Comfortable but warm")).toBeInTheDocument();
    const row = screen.getByText("Comfortable but warm").closest("tr") as HTMLElement;
    await user.click(within(row).getByRole("button", { name: "Reject" }));

    await waitFor(() => {
      expect(screen.queryByText("Comfortable but warm")).not.toBeInTheDocument();
    });

    expect(await screen.findByText("Comfortable but warm")).toBeInTheDocument();
  });

  it("Admin delete fires ConfirmDialog, then calls DELETE /reviews/admin/:id on confirmation", async () => {
    const user = userEvent.setup();
    let deletedReviewId: string | undefined;

    server.use(
      http.delete("*/reviews/admin/:id", ({ params }) => {
        deletedReviewId = String(params.id);
        return new HttpResponse(null, { status: 204 });
      }),
    );

    renderReviewsPage();

    expect(await screen.findByText("Excellent sound")).toBeInTheDocument();
    const row = screen.getByText("Excellent sound").closest("tr") as HTMLElement;
    await user.click(within(row).getByRole("button", { name: "Delete" }));
    await user.click(await screen.findByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(deletedReviewId).toBe("1");
    });
  });
});
