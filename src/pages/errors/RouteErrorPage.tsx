import { AlertTriangle, RefreshCcw } from "lucide-react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import { Button } from "@/components/ui/button";

export default function RouteErrorPage() {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Something went wrong";
  const description = isRouteErrorResponse(error)
    ? "The page could not be loaded."
    : error instanceof Error
      ? error.message
      : "An unexpected routing error occurred.";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      <Button type="button" variant="outline" onClick={() => window.location.reload()}>
        <RefreshCcw className="mr-2 h-4 w-4" />
        Reload Page
      </Button>
    </div>
  );
}
