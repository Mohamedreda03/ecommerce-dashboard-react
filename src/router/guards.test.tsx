import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AuthGuard from "./AuthGuard";
import PermissionGuard from "./PermissionGuard";
import { useAuthStore } from "@/stores/auth.store";

describe("Router Guards", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, isHydrated: false });
  });

  describe("AuthGuard", () => {
    it("renders a skeleton while isHydrated=false", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route element={<AuthGuard />}>
              <Route path="/" element={<div>Protected Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
      // Check for the spinner/skeleton div
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("redirects to /login when isHydrated=true and user=null", () => {
      useAuthStore.setState({ isHydrated: true, user: null });

      render(
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route element={<AuthGuard />}>
              <Route path="/" element={<div>Protected Content</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    it("redirects to /forbidden when authenticated user has only CUSTOMER permissions (isAdminUser=false)", () => {
      useAuthStore.setState({
        isHydrated: true,
        user: {
          id: 1,
          email: "customer@c.com",
          roles: ["CUSTOMER"],
          permissions: ["read:product"],
        },
      });

      render(
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route element={<AuthGuard />}>
              <Route path="/" element={<div>Protected Content</div>} />
            </Route>
            <Route path="/forbidden" element={<div>Forbidden Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText("Forbidden Page")).toBeInTheDocument();
    });
  });

  describe("PermissionGuard", () => {
    it("redirects to /forbidden when user lacks the required permission", () => {
      useAuthStore.setState({
        isHydrated: true,
        user: {
          id: 1,
          email: "admin@a.com",
          roles: ["ADMIN"],
          permissions: ["read:product"],
        },
      });

      render(
        <MemoryRouter initialEntries={["/guarded"]}>
          <Routes>
            <Route element={<PermissionGuard permission="create:product" />}>
              <Route path="/guarded" element={<div>Create Product</div>} />
            </Route>
            <Route path="/forbidden" element={<div>Forbidden Page</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText("Forbidden Page")).toBeInTheDocument();
    });

    it("renders <Outlet> when user holds the required permission", () => {
      useAuthStore.setState({
        isHydrated: true,
        user: {
          id: 1,
          email: "admin@a.com",
          roles: ["ADMIN"],
          permissions: ["create:product"],
        },
      });

      render(
        <MemoryRouter initialEntries={["/guarded"]}>
          <Routes>
            <Route element={<PermissionGuard permission="create:product" />}>
              <Route
                path="/guarded"
                element={<div>Create Product Content</div>}
              />
            </Route>
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText("Create Product Content")).toBeInTheDocument();
    });
  });
});
