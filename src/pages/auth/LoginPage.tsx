import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

export default function LoginPage() {
  const user = useAuthStore((state) => state.user);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <div>LoginPage</div>;
}
