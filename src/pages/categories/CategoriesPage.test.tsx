import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";

import CategoriesPage from "./CategoriesPage";
import { server } from "@/test/mocks/server";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderCategoriesPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CategoriesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Phase 13: Categories Management", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: 1,
        email: "admin@example.com",
        roles: ["ADMIN"],
        permissions: [
          "read:category",
          "create:category",
          "update:category",
          "delete:category",
        ],
      },
      accessToken: "mock-access-token",
      isHydrated: true,
    });
  });

  it("Category list indents child categories under their parent", async () => {
    renderCategoriesPage();

    await waitFor(() => {
      expect(screen.getAllByText("Electronics").length).toBeGreaterThan(0);
    });
    expect(screen.getByText("↳ Headphones")).toBeInTheDocument();
  });

  it("parentId select excludes the category currently being edited", async () => {
    const user = userEvent.setup();
    renderCategoriesPage();

    await waitFor(() => {
      expect(screen.getAllByText("Electronics").length).toBeGreaterThan(0);
    });

    const electronicsRow = screen.getAllByText("Electronics")[0].closest("tr") as HTMLElement;
    await user.click(within(electronicsRow).getByRole("button", { name: "Edit" }));

    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("combobox"));

    expect(screen.queryByRole("option", { name: /^Electronics$/ })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: /^Apparel$/ })).toBeInTheDocument();
  });

  it("Create category form submits POST /categories with correct body", async () => {
    const user = userEvent.setup();
    let requestBody: unknown;

    server.use(
      http.post("*/categories", async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(
          {
            id: 99,
            name: "Accessories",
            slug: "accessories",
            description: "Accessories and add-ons",
            parentId: 1,
            image: "https://example.com/accessories.jpg",
            sortOrder: 4,
            isActive: true,
            productCount: 0,
            createdAt: "2024-04-01T00:00:00.000Z",
            updatedAt: "2024-04-01T00:00:00.000Z",
          },
          { status: 201 },
        );
      }),
    );

    renderCategoriesPage();

    await waitFor(() => {
      expect(screen.getAllByText("Electronics").length).toBeGreaterThan(0);
    });
    await user.click(screen.getByRole("button", { name: "New Category" }));

    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("Name"), "Accessories");
    await user.type(
      within(dialog).getByLabelText("Description"),
      "Accessories and add-ons",
    );
    await user.click(within(dialog).getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Electronics" }));
    await user.type(
      within(dialog).getByLabelText("Image URL"),
      "https://example.com/accessories.jpg",
    );
    await user.clear(within(dialog).getByLabelText("Sort Order"));
    await user.type(within(dialog).getByLabelText("Sort Order"), "4");
    await user.click(within(dialog).getByRole("button", { name: "Create Category" }));

    await waitFor(() => {
      expect(requestBody).toEqual({
        name: "Accessories",
        description: "Accessories and add-ons",
        parentId: 1,
        image: "https://example.com/accessories.jpg",
        sortOrder: 4,
        isActive: true,
      });
    });
  });

  it("Force-delete dialog appends ?force=true to the DELETE request when the user confirms", async () => {
    const user = userEvent.setup();
    let forceQuery: string | null = null;

    server.use(
      http.delete("*/categories/:id", ({ request }) => {
        forceQuery = new URL(request.url).searchParams.get("force");
        return HttpResponse.json({ success: true, force: forceQuery });
      }),
    );

    renderCategoriesPage();

    await waitFor(() => {
      expect(screen.getAllByText("Electronics").length).toBeGreaterThan(0);
    });

    const electronicsRow = screen.getAllByText("Electronics")[0].closest("tr") as HTMLElement;
    await user.click(within(electronicsRow).getByRole("button", { name: "Delete" }));
    await user.click(await screen.findByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(forceQuery).toBe("true");
    });
  });
});
