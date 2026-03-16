import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/api/auth.api";
import "./App.css";

function App() {
  const { accessToken, setTokens, setUser, isHydrated } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      // If we don't have an access token, we still mark as hydrated
      if (!accessToken) {
        useAuthStore.setState({ isHydrated: true });
        return;
      }

      try {
        const user = await authApi.getMe();
        setUser(user);
      } catch (error) {
        // Validation handled by the interceptor
      } finally {
        useAuthStore.setState({ isHydrated: true });
      }
    };

    initAuth();
  }, [accessToken, setUser, setTokens]);

  if (!isHydrated) {
    return <div>Loading...</div>; // Will be replaced by router/skeleton logic later
  }

  return (
    <div>
      <h1>Ecommerce Dashboard Setup Active</h1>
    </div>
  );
}

export default App;
