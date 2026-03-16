import { type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

interface SidebarItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  badge?: string | number;
  requiredPermission?: string;
  isCollapsed?: boolean;
  onClick?: () => void;
}

export default function SidebarItem({
  to,
  icon,
  label,
  badge,
  requiredPermission,
  isCollapsed,
  onClick,
}: SidebarItemProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return null;
  }

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
          "hover:bg-muted/50",
          isActive && "bg-muted text-primary font-medium",
          isCollapsed && "justify-center px-0",
        )
      }
      title={isCollapsed ? label : undefined}
      end={to === "/"}
    >
      <div className="flex h-5 w-5 items-center justify-center shrink-0">
        {icon}
      </div>
      {!isCollapsed && <span className="flex-1 truncate text-sm">{label}</span>}
      {!isCollapsed && badge !== undefined && (
        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {badge}
        </span>
      )}
    </NavLink>
  );
}
