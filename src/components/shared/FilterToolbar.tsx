import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FilterToolbarProps {
  children: ReactNode;
  className?: string;
}

export default function FilterToolbar({ children, className }: FilterToolbarProps) {
  return (
    <div className={cn("grid gap-4 rounded-lg border p-4", className)}>
      {children}
    </div>
  );
}
