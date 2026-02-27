"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { PostListItemDto } from "@/types/api";

interface CarPostCardProps {
  post: PostListItemDto;
  /** Optional image URL; placeholder used if not provided */
  imageUrl?: string | null;
  /** Optional location text */
  location?: string | null;
  /** Optional short description; falls back to category or title */
  description?: string | null;
}

function formatPrice(price: number): string {
  return price >= 1000
    ? `${price.toLocaleString("vi-VN")}₫`
    : `$${price.toLocaleString("en-US")}`;
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=250&fit=crop";

export default function CarPostCard({
  post,
  imageUrl,
  location,
  description,
}: CarPostCardProps) {
  const imgSrc = imageUrl || PLACEHOLDER_IMAGE;
  const locationText = location ?? "—";
  const shortDesc =
    description ??
    post.categoryName ??
    (post.title.length > 60 ? `${post.title.slice(0, 60)}…` : post.title);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 ease-out hover:scale-[1.03] hover:border-primary/20 hover:shadow-xl">
      <Link href={`/cars/${post.id}`} className="block flex-1">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-50">
          <Image
            src={imgSrc}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            unoptimized={imgSrc.startsWith("http")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 right-0 flex justify-center p-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <span className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg">
              Xem chi tiết
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          {post.categoryName && (
            <span className="inline-block w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              {post.categoryName}
            </span>
          )}
          <h3 className="mt-2 line-clamp-2 text-[15px] font-bold text-slate-900 transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
          <p className="mt-2 line-clamp-2 text-[12px] text-slate-500">
            {shortDesc}
          </p>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              Giá từ
            </p>
            <p className="text-base font-bold text-slate-900">
              {formatPrice(Number(post.price))}
              <span className="text-xs font-normal text-slate-400">/ngày</span>
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
