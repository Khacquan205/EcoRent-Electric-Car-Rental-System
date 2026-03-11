"use client";

/**
 * Skeleton placeholder for PostCard while data is loading.
 * Uses a sliding shimmer gradient over a pulse-animated background.
 */
export default function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/80">
      {/* 4:3 thumbnail shimmer */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
        <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
      </div>

      <div className="flex flex-col gap-2.5 p-4">
        {/* Category badge */}
        <div className="h-4 w-20 animate-pulse rounded-full bg-gray-100" />

        {/* Title — two lines */}
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded-md bg-gray-100" />
          <div className="h-4 w-4/5 animate-pulse rounded-md bg-gray-100" />
        </div>

        {/* Expiry */}
        <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />

        {/* Price */}
        <div className="mt-1 h-6 w-32 animate-pulse rounded-md bg-gray-100" />
      </div>
    </div>
  );
}
