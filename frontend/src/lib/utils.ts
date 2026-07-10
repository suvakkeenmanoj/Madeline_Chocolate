import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_STYLES } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getPaymentStatusLabel(status: string) {
  return PAYMENT_STATUS_LABELS[status] || status;
}

export function getPaymentStatusClass(status: string) {
  return PAYMENT_STATUS_STYLES[status] || "bg-gray-100 text-gray-700";
}

export function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
