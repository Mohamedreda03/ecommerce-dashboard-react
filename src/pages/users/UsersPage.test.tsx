import { render, screen, waitFor } from "@testing-library/react";
// removed invalid import: userEvent
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import UsersPage from "./UsersPage";
import { describe, it, expect, beforeEach } from "vitest";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>,
  );
};

describe("UsersPage Phase 10", () => {
  beforeEach(() => {
    queryClient.clear();
    useAuthStore.setState({
      user: {
        id: 1,
        email: "test@example.com",
        firstName: "Test",
        lastName: "Admin",
        roles: ["Admin"],
        permissions: ["create:user", "delete:user"],
      },
      accessToken: "fake-jwt-token",
    });
  });

  it("renders users table with data", async () => {
    renderWithProviders(<UsersPage />);
    expect(await screen.findByText("admin@example.com")).toBeInTheDocument();
  });
});
