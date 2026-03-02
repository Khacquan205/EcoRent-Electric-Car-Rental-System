/**
 * Shared helpers for post display formatting.
 */

/** Format a number as Vietnamese currency (₫). */
export function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "₫";
}

/** Format an ISO date string as dd/MM/yyyy. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Returns human-readable expiry text.
 * - "Còn X ngày"  — still valid
 * - "Hết hạn hôm nay"
 * - "Đã hết hạn"
 */
export function formatExpiry(expiredAt: string | null | undefined): string {
  if (!expiredAt) return "";
  const now = new Date();
  const exp = new Date(expiredAt);
  const diffMs = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return `Còn ${diffDays} ngày`;
  if (diffDays === 0) return "Hết hạn hôm nay";
  return "Đã hết hạn";
}

/** Returns true if the expiry date is in the past. */
export function isExpired(expiredAt: string | null | undefined): boolean {
  if (!expiredAt) return false;
  return new Date(expiredAt).getTime() < Date.now();
}

/** POST STATUS CONSTANTS */
export const POST_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
} as const;

export type PostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS];
