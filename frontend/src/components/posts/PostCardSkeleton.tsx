"use client";

/**
 * Skeleton placeholder for PostCard while data is loading.
 * Uses a sliding shimmer gradient over a pulse-animated background.
 */
export default function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60 dark:bg-gray-900 dark:ring-gray-700/60">
      {/* Thumbnail shimmer */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
        <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/50 to-transparent dark:via-white/8" />
      </div>

      <div className="flex flex-col gap-2.5 p-4">
        {/* Category badge */}
        <div className="h-5 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />

        {/* Title — two lines */}
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-4/5 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Price */}
        <div className="h-6 w-36 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />

        {/* Date row */}
        <div className="flex gap-4 border-t border-gray-100 pt-3 dark:border-gray-800">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
