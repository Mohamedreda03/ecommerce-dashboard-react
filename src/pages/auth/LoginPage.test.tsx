import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";

import LoginPage from "./LoginPage";
import { useAuthStore } from "@/stores/auth.store";

describe("Phase 8: LoginPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isHydrated: true });
    queryClient = new QueryClient();
  });

  const setup = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/login"]}>
          <Toaster />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>Dashboard Home</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  it("redirects to / if already authenticated", () => {
    useAuthStore.setState({
      user: { id: 1, email: "a@a.com", roles: [], permissions: [] } as any,
    });
    setup();
    expect(screen.getByText("Dashboard Home")).toBeInTheDocument();
  });

  it("shows inline validation error for a non-email value in the email field", async () => {
    setup();

    const emailInput = screen.getByLabelText(/Email/i);
    await userEvent.type(emailInput, "not-an-email");

    const submitBtn = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitBtn);

    expect(await screen.findByText(/Invalid email/i)).toBeInTheDocument();
  });

  it("shows validation error for a password shorter than 8 characters", async () => {
    setup();

    const passwordInput = screen.getByLabelText(/Password/i);
    await userEvent.type(passwordInput, "short");

    const submitBtn = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitBtn);

    expect(
      await screen.findByText(/Password must be at least 8 characters/i),
    ).toBeInTheDocument();
  });

  it("successful login redirects to / and updates store", async () => {
    setup();

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    await userEvent.type(emailInput, "admin@example.com");
    await userEvent.type(passwordInput, "password123");

    const submitBtn = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitBtn);

    // Wait for the mock API response and redirect
    await waitFor(() => {
      expect(screen.getByText("Dashboard Home")).toBeInTheDocument();
    });

    const state = useAuthStore.getState();
    expect(state.user).not.toBeNull();
    expect(state.accessToken).toBe("mock-access-token");
  });

  it("failed login (MSW returns 401) shows error toast and user remains on /login", async () => {
    server.use(
      http.post("*/auth/login", () => {
        return new HttpResponse(
          JSON.stringify({ message: "Invalid credentials" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }),
    );

    setup();

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    // According to mock setup, anything other than admin@example.com will trigger 401
    await userEvent.type(emailInput, "wrong@example.com");
    await userEvent.type(passwordInput, "password123");

    const submitBtn = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(submitBtn);

    // Wait for the toast to appear
    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();

    // Check we did not route to dashboard
    expect(screen.queryByText("Dashboard Home")).not.toBeInTheDocument();
  });
});
