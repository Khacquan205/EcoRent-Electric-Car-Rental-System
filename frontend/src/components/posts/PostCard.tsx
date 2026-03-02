"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, ImageOff, PlayCircle, Tag } from "lucide-react";
import type { PostListItemDto } from "@/types/api";
import {
  formatDate,
  formatExpiry,
  isExpired,
  formatPrice,
} from "@/utils/postHelpers";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=450&fit=crop";

interface PostCardProps {
  post: PostListItemDto;
  /** Stagger index → each step adds 55 ms entrance delay */
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
        "group flex flex-col overflow-hidden rounded-2xl bg-white",
        "shadow-sm ring-1 ring-gray-200/80",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-xl hover:ring-blue-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "animate-in fade-in slide-in-from-bottom-4",
        expired ? "opacity-60" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ animationDelay: `${index * 55}ms`, animationFillMode: "both" }}
    >
      {/* ── Image (4:3) ─────────────────────────────────────── */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
        {hasImages ? (
          <Image
            src={post.images![0]}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
        ) : hasVideos ? (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200">
                <PlayCircle className="h-6 w-6 text-blue-500" />
              </span>
              <span className="text-xs text-gray-400">Video</span>
            </div>
          </div>
        ) : (
          <>
            <Image
              src={PLACEHOLDER_IMAGE}
              alt="Chưa có ảnh"
              fill
              className="object-cover opacity-40"
              sizes="(max-width: 640px) 100vw, 25vw"
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageOff className="h-9 w-9 text-gray-300" />
            </div>
          </>
        )}

        {/* Category badge — top-left */}
        {post.categoryName && (
          <div className="absolute left-3 top-3 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 shadow-sm backdrop-blur-sm">
              <Tag className="h-2.5 w-2.5 shrink-0" />
              {post.categoryName}
            </span>
          </div>
        )}

        {/* Hover overlay + CTA */}
        <div className="absolute inset-0 bg-blue-600/0 transition-colors duration-300 group-hover:bg-blue-600/8" />
        <div className="absolute inset-x-0 bottom-0 flex translate-y-1 items-center justify-center pb-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="rounded-full bg-blue-600 px-5 py-1.5 text-xs font-bold tracking-wide text-white shadow-lg shadow-blue-600/30">
            Xem chi tiết →
          </span>
        </div>
      </div>

      {/* ── Card body ──────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Title */}
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-blue-600">
          {post.title}
        </h3>

        {/* Expiry / date */}
        <p
          className={`flex items-center gap-1 text-xs ${
            expired ? "text-red-500" : "text-gray-400"
          }`}
        >
          <Clock className="h-3 w-3 shrink-0" />
          {expired ? "Đã hết hạn" : expiryText || formatDate(post.createdAt)}
        </p>

        {/* Price pushed to bottom */}
        <p className="mt-auto pt-3 text-xl font-extrabold text-blue-600">
          {formatPrice(post.price)}
          <span className="ml-1 text-xs font-normal text-gray-400">/ngày</span>
        </p>
      </div>
    </Link>
  );
}
