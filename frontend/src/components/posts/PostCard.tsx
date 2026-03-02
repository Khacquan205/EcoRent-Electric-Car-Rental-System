"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Tag, Clock, ImageOff, PlayCircle } from "lucide-react";
import type { PostListItemDto } from "@/types/api";
import StatusBadge from "./StatusBadge";
import PriceTag from "./PriceTag";
import { formatDate, formatExpiry, isExpired } from "@/utils/postHelpers";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=640&h=400&fit=crop";

interface PostCardProps {
  post: PostListItemDto;
  /**
   * Stagger index for entrance animation.
   * Each step adds 50 ms of delay → items fan in from top-left to bottom-right.
   */
  index?: number;
}

export default function PostCard({ post, index = 0 }: PostCardProps) {
  const hasImages = post.images != null && post.images.length > 0;
  const hasVideos = post.videos != null && post.videos.length > 0;

  const expired = isExpired(post.expiredAt);
  const expiryText = formatExpiry(post.expiredAt);

  return (
    <Link
      href={`/posts/${post.id}`}
      className={[
        "group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm",
        "ring-1 ring-gray-200/60 transition-all duration-300 ease-out",
        "hover:-translate-y-1.5 hover:shadow-xl hover:ring-blue-300",
        "dark:bg-gray-900 dark:ring-gray-700/60 dark:hover:ring-blue-600/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "animate-in fade-in slide-in-from-bottom-4",
        expired ? "opacity-60" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ animationDelay: `${index * 55}ms`, animationFillMode: "both" }}
    >
      {/* ── Thumbnail ──────────────────────────────────────────── */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {hasImages ? (
          /* Real image */
          <Image
            src={post.images![0]}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
        ) : hasVideos ? (
          /* Video-only post — stylised dark card with play icon (avoids loading 12 videos in a grid) */
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-800 to-gray-900 transition-all duration-300 group-hover:from-gray-700 group-hover:to-gray-800">
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-2 ring-white/20 transition-all duration-300 group-hover:bg-white/20 group-hover:ring-white/40">
                <PlayCircle className="h-8 w-8 text-white/80" />
              </span>
              <span className="text-[11px] font-medium text-white/40">
                Video
              </span>
            </div>
          </div>
        ) : (
          /* No media */
          <>
            <Image
              src={PLACEHOLDER_IMAGE}
              alt="Chưa có ảnh"
              fill
              className="object-cover opacity-35 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 25vw"
              unoptimized
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
              <ImageOff className="h-9 w-9 text-gray-300 dark:text-gray-600" />
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                Chưa có ảnh
              </span>
            </div>
          </>
        )}

        {/* Status badge — top-left */}
        <div className="absolute left-3 top-3 z-10">
          <StatusBadge status={post.status} statusName={post.statusName} />
        </div>

        {/* Hover gradient + CTA pill */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 flex translate-y-1.5 items-center justify-center pb-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="rounded-full bg-[#1572D3] px-5 py-1.5 text-xs font-bold tracking-wide text-white shadow-lg shadow-blue-600/30">
            Xem chi tiết →
          </span>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Category */}
        {post.categoryName && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
            <Tag className="h-2.5 w-2.5 shrink-0" />
            {post.categoryName}
          </span>
        )}

        {/* Title — 2-line clamp with ellipsis */}
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#1572D3] dark:text-gray-100 dark:group-hover:text-blue-400">
          {post.title}
        </h3>

        {/* Price */}
        <PriceTag price={post.price} size="sm" />

        {/* Dates — pushed to card bottom via flex + mt-auto */}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-100 pt-3 text-[11px] text-gray-400 dark:border-gray-800 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 shrink-0" />
            {formatDate(post.createdAt)}
          </span>
          {expiryText && (
            <span
              className={`flex items-center gap-1 font-semibold ${
                expired
                  ? "text-red-500 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <Clock className="h-3 w-3 shrink-0" />
              {expiryText}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
