import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginCredentials } from "@/types/auth.types";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useLogin() {
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      setTokens(data.accessToken);
      setUser(data.user);
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
    },
  });
}

export function useGetMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => authApi.getMe(),
    // me is usually fetched on boot, so we don't necessarily need to refetch it often
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
