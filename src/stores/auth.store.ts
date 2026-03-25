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
  /**
   * Strictly relies on the permissions array from the JWT or User object.
   * Format: "action:subject" (e.g., "create:product")
   * Respects "manage:all" as a super-admin bypass.
   */
  can: (action: string, subject: string) => boolean;
  /**
   * Helper to check for a raw permission string.
   */
  hasPermission: (perm: string) => boolean;
}

/**
 * Basic JWT decoder to extract permissions if they aren't directly on the user object.
 */
function decodeJWT(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isHydrated: false,

      setTokens: (accessToken) => {
        const currentStates = get();
        const user = currentStates.user;
        
        if (accessToken && user) {
          const payload = decodeJWT(accessToken);
          if (payload?.permissions) {
            // Merge permissions from token into user object
            set({ 
              accessToken, 
              user: { ...user, permissions: payload.permissions } 
            });
            return;
          }
        }
        set({ accessToken });
      },

      setUser: (user) => {
        const currentStates = get();
        const accessToken = currentStates.accessToken;
        
        if (user && accessToken) {
          const payload = decodeJWT(accessToken);
          if (payload?.permissions) {
            // Ensure permissions are attached
            set({ user: { ...user, permissions: payload.permissions }, isHydrated: true });
            return;
          }
        }
        set({ user, isHydrated: true });
      },

      clearAuth: () => set({ user: null, accessToken: null, isHydrated: true }),

      can: (action, subject) => {
        const user = get().user;
        if (!user) return false;

        const permissions = user.permissions || [];
        
        // 1. Super Admin Bypass (manage:all)
        if (permissions.includes("manage:all")) return true;

        // 2. Exact Action:Subject Match
        return permissions.includes(`${action}:${subject}`);
      },

      hasPermission: (perm: string) => {
        const user = get().user;
        if (!user) return false;
        
        const permissions = user.permissions || [];
        if (permissions.includes("manage:all")) return true;
        
        return permissions.includes(perm);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        accessToken: state.accessToken,
        user: state.user 
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
