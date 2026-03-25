import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/api/auth.api";
import { router } from "@/router";
import "./App.css";

function App() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      if (!accessToken) {
        useAuthStore.setState({ isHydrated: true });
        return;
      }

      try {
        const user = await authApi.getMe();
        if (mounted) {
          setUser(user);
        }
      } catch {
        // Validation handled by the interceptor
      } finally {
        if (mounted) {
          useAuthStore.setState({ isHydrated: true });
        }
      }
    };

    if (!isHydrated) {
      initAuth();
    }

    return () => {
      mounted = false;
    };
  }, [accessToken, setUser, isHydrated]);

  return <RouterProvider router={router} />;
}

export default App;
