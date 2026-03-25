import { useAuthStore } from "@/stores/auth.store";

/**
 * Hook to manage permissions within components.
 * Strictly uses the permissions array and bypasses if manage:all is present.
 */
export function usePermissions() {
  const can = useAuthStore((state) => state.can);
  const user = useAuthStore((state) => state.user);

  return {
    /**
     * @param action - e.g. "create", "read", "update", "delete"
     * @param subject - e.g. "product", "order", "user"
     */
    can,
    permissions: user?.permissions || [],
    isLoggedIn: !!user,
  };
}
