import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { http, HttpResponse } from "msw";

import ProductsPage from "./ProductsPage";
import ProductFormPage from "./ProductFormPage";
import { server } from "@/test/mocks/server";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderProductsList() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/products"]}>
        <Routes>
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<div>Product Edit Route</div>} />
          <Route path="/products/new" element={<div>New Product Route</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function renderProductForm(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id" element={<ProductFormPage />} />
          <Route path="/products" element={<div>Products Route</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Phase 12: Products Management", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: 1,
        email: "admin@example.com",
        roles: ["ADMIN"],
        permissions: [
          "read:product",
          "create:product",
          "update:product",
          "delete:product",
        ],
      },
      accessToken: "mock-access-token",
      isHydrated: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("Products list renders rows from MSW GET /products/admin/all fixture", async () => {
    renderProductsList();

    expect(await screen.findByText("Wireless Headphones")).toBeInTheDocument();
    expect(screen.getByText("Cotton Hoodie")).toBeInTheDocument();
    expect(screen.getByText("WH-1000")).toBeInTheDocument();
  });

  it("Low-stock warning badge appears when stock is below lowStockThreshold", async () => {
    renderProductsList();

    expect(await screen.findByText("Wireless Headphones")).toBeInTheDocument();
    expect(screen.getAllByText("Low stock").length).toBeGreaterThan(0);
  });

  it("Search input is debounced and only triggers one extra API call after 300ms", async () => {
    let requestCount = 0;

    server.use(
      http.get("*/products/admin/all", ({ request }) => {
        requestCount += 1;
        const search = new URL(request.url).searchParams.get("search") ?? "";
        return HttpResponse.json({
          data: search ? [] : [],
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

    renderProductsList();

    await waitFor(() => expect(requestCount).toBe(1));

    const searchInput = screen.getByPlaceholderText("Search name or SKU...");
    fireEvent.change(searchInput, { target: { value: "a" } });
    fireEvent.change(searchInput, { target: { value: "ab" } });
    fireEvent.change(searchInput, { target: { value: "abc" } });
    expect(requestCount).toBe(1);

    await new Promise((resolve) => setTimeout(resolve, 350));

    await waitFor(() => expect(requestCount).toBe(2));
  }, 10000);

  it("Product form blocks submission when name, price, or sku is empty", async () => {
    const user = userEvent.setup();
    let submitCount = 0;

    server.use(
      http.post("*/products", async () => {
        submitCount += 1;
        return HttpResponse.json({}, { status: 201 });
      }),
    );

    renderProductForm("/products/new");

    await user.click(screen.getByRole("button", { name: "Create Product" }));

    await waitFor(() => {
      expect(
        screen.getAllByText(/expected string to have >=2 characters/i).length,
      ).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(/must be a valid price/i).length).toBeGreaterThan(0);
    expect(submitCount).toBe(0);
  });

  it("File upload calls POST /files/upload-multiple and returned URLs appear in the image preview list", async () => {
    let uploadCalled = false;

    server.use(
      http.post("*/files/upload-multiple", async ({ request }) => {
        uploadCalled = true;
        const formData = await request.formData();
        const files = formData.getAll("files[]") as File[];

        return HttpResponse.json({
          urls: files.map((file) => `https://example.com/uploads/${file.name}`),
          filenames: files.map((file) => file.name),
        });
      }),
    );

    renderProductForm("/products/new");

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: {
        files: [
          new File(["first"], "first.png", { type: "image/png" }),
          new File(["second"], "second.png", { type: "image/png" }),
        ],
      },
    });

    await waitFor(() => expect(uploadCalled).toBe(true));
    expect(await screen.findByAltText("Uploaded 1")).toBeInTheDocument();
    expect(screen.getByAltText("Uploaded 2")).toBeInTheDocument();
  });

  it("Image reorder fires PATCH /products/:id/images/reorder with the updated imageIds array", async () => {
    let reorderRequestBody: unknown;

    server.use(
      http.patch("*/products/:id/images/reorder", async ({ request }) => {
        reorderRequestBody = await request.json();
        return HttpResponse.json({
          id: 1,
          name: "Wireless Headphones",
          price: "199.99",
          sku: "WH-1000",
          description: "Noise-cancelling over-ear headphones",
          shortDescription: "Premium wireless headphones",
          compareAtPrice: "249.99",
          costPrice: "120.00",
          stock: 3,
          lowStockThreshold: 5,
          weight: "0.45",
          isActive: true,
          isFeatured: true,
          categoryId: 1,
          images: [
            {
              id: 102,
              url: "https://example.com/images/headphones-2.jpg",
              alt: "Wireless Headphones Side",
              sortOrder: 0,
            },
            {
              id: 101,
              url: "https://example.com/images/headphones-1.jpg",
              alt: "Wireless Headphones",
              sortOrder: 1,
            },
          ],
          deletedAt: null,
          createdAt: "2024-01-10T00:00:00.000Z",
          updatedAt: "2024-01-10T00:00:00.000Z",
        });
      }),
    );

    renderProductForm("/products/1");

    expect(await screen.findByText("Existing Images")).toBeInTheDocument();

    const image101 = screen.getByText("Image #101").closest("div[draggable='true']") as HTMLElement;
    const image102 = screen.getByText("Image #102").closest("div[draggable='true']") as HTMLElement;

    fireEvent.dragStart(image101);
    fireEvent.dragOver(image102);
    fireEvent.drop(image102);

    await waitFor(() => {
      expect(reorderRequestBody).toEqual({ imageIds: [102, 101] });
    });
  });
});
