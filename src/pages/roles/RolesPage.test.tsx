import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";

import RolesPage from "./RolesPage";
import { server } from "@/test/mocks/server";
import { useAuthStore } from "@/stores/auth.store";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderRolesPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RolesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function getCheckboxByLabel(container: HTMLElement, label: string) {
  const labelText = within(container).getByText(label);
  const checkbox = labelText
    .closest("label")
    ?.parentElement?.querySelector('[role="checkbox"]');

  if (!(checkbox instanceof HTMLElement)) {
    throw new Error(`Checkbox for "${label}" was not found`);
  }

  return checkbox;
}

describe("Phase 11: Roles & Permissions", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: {
        id: 1,
        email: "admin@example.com",
        roles: ["ADMIN"],
        permissions: ["read:role", "create:role", "update:role", "delete:role"],
      },
      accessToken: "mock-access-token",
      isHydrated: true,
    });
  });

  it("renders a card for each role with name and permission count badge", async () => {
    renderRolesPage();

    expect(await screen.findByText("SUPER_ADMIN")).toBeInTheDocument();
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getByText("CUSTOMER")).toBeInTheDocument();
    expect(screen.getByText("EDITOR")).toBeInTheDocument();

    expect(screen.getAllByText("1 permission").length).toBeGreaterThan(0);
    expect(screen.getByText("3 permissions")).toBeInTheDocument();
    expect(screen.getAllByText("Built-in")).toHaveLength(3);
  });

  it("disables delete for SUPER_ADMIN, ADMIN, and CUSTOMER while leaving custom roles deletable", async () => {
    renderRolesPage();

    await screen.findByText("SUPER_ADMIN");

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    expect(deleteButtons).toHaveLength(4);
    expect(deleteButtons[0]).toBeDisabled();
    expect(deleteButtons[1]).toBeDisabled();
    expect(deleteButtons[2]).toBeDisabled();
    expect(deleteButtons[3]).toBeEnabled();
  });

  it("groups permission checklist by subject using GET /permissions data", async () => {
    const user = userEvent.setup();
    renderRolesPage();

    await screen.findByText("SUPER_ADMIN");
    await user.click(screen.getByRole("button", { name: "New Role" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Permissions")).toBeInTheDocument();
    expect(within(dialog).getByText("product")).toBeInTheDocument();
    expect(within(dialog).getByText("user")).toBeInTheDocument();
    expect(within(dialog).getByText("role")).toBeInTheDocument();
    expect(within(dialog).getByText("analytics")).toBeInTheDocument();
    expect(getCheckboxByLabel(dialog, "read:product")).toBeInTheDocument();
    expect(getCheckboxByLabel(dialog, "create:user")).toBeInTheDocument();
  });

  it("submits POST /roles with name, description, and permissionIds", async () => {
    const user = userEvent.setup();
    let createRequestBody: unknown;

    server.use(
      http.post("*/roles", async ({ request }) => {
        createRequestBody = await request.json();
        return HttpResponse.json(
          {
            id: 99,
            name: "Catalog Manager",
            description: "Manages catalog content",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
            permissions: [],
          },
          { status: 201 },
        );
      }),
    );

    renderRolesPage();

    await screen.findByText("SUPER_ADMIN");
    await user.click(screen.getByRole("button", { name: "New Role" }));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("Role Name"), "Catalog Manager");
    await user.type(
      within(dialog).getByLabelText("Description"),
      "Manages catalog content",
    );
    await user.click(getCheckboxByLabel(dialog, "read:product"));
    await user.click(getCheckboxByLabel(dialog, "create:category"));
    await user.click(within(dialog).getByRole("button", { name: "Create Role" }));

    await waitFor(() => {
      expect(createRequestBody).toEqual({
        name: "Catalog Manager",
        description: "Manages catalog content",
        permissionIds: [2, 13],
      });
    });
  });

  it("pre-checks existing permissions and submits PATCH /roles/:id with the full updated permissionIds array", async () => {
    const user = userEvent.setup();
    let updateRequestBody: unknown;

    server.use(
      http.get("*/roles", () =>
        HttpResponse.json([
          {
            id: 4,
            name: "EDITOR",
            description: "Content editor role",
            createdAt: "2024-01-02T00:00:00.000Z",
            updatedAt: "2024-01-02T00:00:00.000Z",
            permissions: [
              {
                permission: {
                  id: 2,
                  action: "read",
                  subject: "product",
                  description: "View products",
                },
              },
              {
                permission: {
                  id: 4,
                  action: "update",
                  subject: "product",
                  description: "Edit products",
                },
              },
            ],
          },
        ]),
      ),
      http.get("*/permissions", () =>
        HttpResponse.json([
          { id: 2, action: "read", subject: "product", description: "View products" },
          { id: 3, action: "create", subject: "product", description: "Create products" },
          { id: 4, action: "update", subject: "product", description: "Edit products" },
        ]),
      ),
      http.patch("*/roles/:id", async ({ request }) => {
        updateRequestBody = await request.json();
        return HttpResponse.json({
          id: 4,
          name: "EDITOR",
          description: "Updated editor role",
          createdAt: "2024-01-02T00:00:00.000Z",
          updatedAt: "2024-01-03T00:00:00.000Z",
          permissions: [],
        });
      }),
    );

    renderRolesPage();

    expect(await screen.findByText("EDITOR")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog");

    const readProductCheckbox = getCheckboxByLabel(dialog, "read:product");
    const updateProductCheckbox = getCheckboxByLabel(dialog, "update:product");
    const createProductCheckbox = getCheckboxByLabel(dialog, "create:product");

    expect(readProductCheckbox).toBeChecked();
    expect(updateProductCheckbox).toBeChecked();
    expect(createProductCheckbox).not.toBeChecked();

    await user.click(createProductCheckbox);
    await user.clear(within(dialog).getByLabelText("Description"));
    await user.type(within(dialog).getByLabelText("Description"), "Updated editor role");
    await user.click(within(dialog).getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(updateRequestBody).toEqual({
        name: "EDITOR",
        description: "Updated editor role",
        permissionIds: [2, 4, 3],
      });
    });
  });

  it("renders the permissions reference table grouped by subject", async () => {
    renderRolesPage();

    expect(await screen.findByRole("heading", { name: "All Available Permissions" })).toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(within(table).getAllByText("product").length).toBeGreaterThan(0);
    expect(within(table).getAllByText("category").length).toBeGreaterThan(0);
    expect(within(table).getByText("read:role")).toBeInTheDocument();
  });
});
