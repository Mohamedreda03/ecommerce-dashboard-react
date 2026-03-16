import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Store, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { appRoutes } from "@/router/routes.config";
import SidebarItem from "./SidebarItem";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Optionally auto-collapse on small desktop screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside
      className={cn(
        "hidden flex-col border-r bg-background transition-all duration-300 md:flex",
        isCollapsed ? "w-[70px]" : "w-64",
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-3">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-2 font-semibold",
            isCollapsed && "justify-center w-full",
          )}
        >
          <Store className="h-6 w-6 text-primary" />
          {!isCollapsed && <span>E-Commerce</span>}
        </Link>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(true)}
          >
            <PanelLeftClose className="h-4 w-4" />
            <span className="sr-only">Collapse Sidebar</span>
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-2 text-sm font-medium gap-1">
          {appRoutes
            .filter((route) => !route.hideInSidebar)
            .map((route) => (
              <SidebarItem
                key={route.path}
                to={route.path}
                icon={route.icon && <route.icon className="h-4 w-4" />}
                label={route.label || ""}
                requiredPermission={route.requiredPermission}
                isCollapsed={isCollapsed}
              />
            ))}
        </nav>
      </div>

      <div
        className={cn("p-4 border-t", isCollapsed && "flex justify-center p-2")}
      >
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
          >
            <PanelLeftOpen className="h-5 w-5" />
            <span className="sr-only">Expand Sidebar</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
