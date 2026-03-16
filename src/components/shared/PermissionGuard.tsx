import { ReactNode } from "react";
import { useAuthStore } from "@/stores/auth.store";

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
