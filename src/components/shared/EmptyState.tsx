import { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title = "No results",
  message,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
        className,
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        {icon || <Inbox className="h-10 w-10 text-muted-foreground" />}
      </div>
      <h2 className="mt-6 text-xl font-semibold">{title}</h2>
      <p className="mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground max-w-sm">
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
