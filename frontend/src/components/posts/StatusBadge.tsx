"use client";

import { CheckCircle, Clock, XCircle } from "lucide-react";

interface StatusBadgeProps {
  /** Numeric status: 0 = Pending, 1 = Approved, 2 = Rejected */
  status: number;
  statusName?: string | null;
  /** "sm" (default) | "md" */
  size?: "sm" | "md";
}

const STATUS_MAP: Record<
  number,
  { label: string; icon: React.ElementType; className: string }
> = {
  0: {
    label: "Chờ duyệt",
    icon: Clock,
    className:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  },
  1: {
    label: "Đã duyệt",
    icon: CheckCircle,
    className:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  },
  2: {
    label: "Bị từ chối",
    icon: XCircle,
    className:
      "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  },
};

export default function StatusBadge({
  status,
  statusName,
  size = "sm",
}: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? {
    label: statusName ?? "Không rõ",
    icon: Clock,
    className:
      "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400",
  };

  const Icon = config.icon;
  const label = statusName ?? config.label;

  const sizeClasses =
    size === "md"
      ? "px-3 py-1.5 text-sm gap-1.5"
      : "px-2.5 py-0.5 text-xs gap-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses} ${config.className}`}
    >
      <Icon className={size === "md" ? "h-4 w-4" : "h-3 w-3"} />
      {label}
    </span>
  );
}
