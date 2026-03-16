import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string | boolean;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  let label = String(status);
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";

  if (typeof status === "boolean") {
    label = status ? "Active" : "Inactive";
    variant = status ? "default" : "secondary";
  } else {
    switch (status.toUpperCase()) {
      case "DELIVERED":
      case "COMPLETED":
      case "SUCCESS":
      case "ACTIVE":
      case "PUBLISHED":
        variant = "default";
        break;
      case "PENDING":
      case "PROCESSING":
        variant = "secondary";
        break;
      case "CANCELLED":
      case "FAILED":
      case "INACTIVE":
      case "DRAFT":
        variant = "destructive";
        break;
      default:
        variant = "outline";
    }
  }

  // Adjust default variant colors if we want custom classes,
  // but using standard variants gives us standard shadcn look.
  // For 'green' delivered, we could use an inline class if default is not green,
  // keeping it simple per shadcn standard.

  const customClasses =
    status === "DELIVERED" || status === "COMPLETED"
      ? "bg-green-500 hover:bg-green-600 text-white"
      : status === "CANCELLED"
        ? "bg-red-500 hover:bg-red-600 text-white"
        : "";

  return (
    <Badge variant={variant} className={customClasses}>
      {label}
    </Badge>
  );
}
