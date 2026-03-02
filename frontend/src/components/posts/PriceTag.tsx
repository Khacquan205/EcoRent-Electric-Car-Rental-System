"use client";

import { formatPrice } from "@/utils/postHelpers";

interface PriceTagProps {
  price: number;
  /** Optional unit suffix shown after price. Default: "/ngày" */
  unit?: string;
  /** "sm" | "md" | "lg". Default "md" */
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: {
    price: "text-base font-bold",
    unit: "text-xs",
  },
  md: {
    price: "text-xl font-bold",
    unit: "text-sm",
  },
  lg: {
    price: "text-3xl font-extrabold",
    unit: "text-base",
  },
};

export default function PriceTag({
  price,
  unit = "/ngày",
  size = "md",
}: PriceTagProps) {
  const s = sizeMap[size];
  return (
    <span className="inline-flex items-baseline gap-1">
      <span
        className={`${s.price} text-[#1572D3] dark:text-blue-400`}
      >
        {formatPrice(price)}
      </span>
      {unit && (
        <span className={`${s.unit} font-normal text-gray-400 dark:text-gray-500`}>
          {unit}
        </span>
      )}
    </span>
  );
}
