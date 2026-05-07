import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyRange(min?: number | null, max?: number | null) {
  if (!min && !max) return "Not listed";
  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
  if (min && max) return `${currency.format(min)} - ${currency.format(max)}`;
  return currency.format(min ?? max ?? 0);
}

export function initials(name?: string | null) {
  return (name ?? "AF")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatDateShort(value?: string | Date | null) {
  if (!value) return "No deadline";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });
}
