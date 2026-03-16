import React, { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import type { AuthUser } from "@/types/auth.types";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  user?: Partial<AuthUser> | null;
  permissions?: string[];
}

export function renderWithProviders(
  ui: ReactElement,
  { user = null, permissions = [], ...renderOptions }: CustomRenderOptions = {},
) {
  // Setup fresh query client for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // Pre-hydrate zustand store if needed
  if (user) {
    useAuthStore.setState({
      user: { ...user, permissions } as AuthUser,
      accessToken: "fake-token",
      isHydrated: true,
    });
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  return {
    store: useAuthStore,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
