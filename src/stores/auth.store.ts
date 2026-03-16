import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser } from "../types/auth.types";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isHydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  setTokens: (accessToken: string | null) => void;
  clearAuth: () => void;
  hasPermission: (perm: string) => boolean;
  isAdminUser: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isHydrated: false,
      setUser: (user) => set({ user, isHydrated: true }),
      setTokens: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ user: null, accessToken: null, isHydrated: true }),
      hasPermission: (perm: string) => {
        const user = get().user;
        if (!user) return false;
        if (user.permissions.includes("manage:all")) return true;
        return user.permissions.includes(perm);
      },
      isAdminUser: () => {
        const user = get().user;
        if (!user || user.permissions.length === 0) return false;

        // Define customer-only permissions that do not grant dashboard access
        const customerPerms = [
          "read:product",
          "create:order",
          "create:review",
          "read:order-own",
          "manage:cart",
          "manage:wishlist",
          "manage:address",
        ];

        // If the user has any permission that is NOT in the customer-only list, they are an admin
        return user.permissions.some((p) => !customerPerms.includes(p));
      },
    }),
    {
      name: "auth-storage",
      // Only keep the accessToken in localStorage. Never store the sensitive user object here.
      partialize: (state) => ({ accessToken: state.accessToken }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
