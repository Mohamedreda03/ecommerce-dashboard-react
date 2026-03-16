import { render, screen } from "@testing-library/react";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import UserDetailPage from "./UserDetailPage";
import { Toaster } from "@/components/ui/sonner";
import { describe, it, expect, beforeEach } from "vitest";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (
  ui: React.ReactElement,
  initialRoute = "/users/1",
) => {
  window.history.pushState({}, "Test page", initialRoute);
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/users/:id" element={ui} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>,
  );
};

describe("UserDetailPage Phase 10", () => {
  beforeEach(() => {
    queryClient.clear();
    useAuthStore.setState({
      user: {
        id: 1,
        email: "test@example.com",
        firstName: "Test",
        lastName: "Admin",
        roles: ["Admin"],
        permissions: ["manage:all"],
      },
      accessToken: "fake-jwt-token",
    });
  });

  it("renders user details and roles", async () => {
    renderWithProviders(<UserDetailPage />);
    expect(await screen.findByText(/Profile/i)).toBeInTheDocument();
  });
});
