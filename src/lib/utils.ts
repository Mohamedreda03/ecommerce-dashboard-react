import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numericAmount);
}

export function formatDate(date: string | Date | number): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatRelativeDate(date: string | Date | number): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
