"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Tag,
  Phone,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Calendar,
  AlertTriangle,
  FileText,
  Share2,
} from "lucide-react";
import type { PostDetailDto } from "@/types/api";
import StatusBadge from "./StatusBadge";
import PriceTag from "./PriceTag";
import { formatDate, formatExpiry, isExpired } from "@/utils/postHelpers";
import { PhoneRevealButton } from "@/components/cars/PhoneRevealButton";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=500&fit=crop";

/* ─── Types ───────────────────────────────────────────────────── */

interface PostDetailProps {
  post: PostDetailDto;
}

type MediaItem =
  | { kind: "image"; src: string }
  | { kind: "video"; src: string };

/* ─── Mixed-media Gallery ─────────────────────────────────────── */

function Gallery({
  images,
  videos,
  title,
}: {
  images: string[];
  videos: string[];
  title: string;
}) {
  // Merge images first, then videos into a unified media array
  const items: MediaItem[] = [
    ...images.map((src) => ({ kind: "image" as const, src })),
    ...videos.map((src) => ({ kind: "video" as const, src })),
  ];

  const [active, setActive] = useState(0);
  const current = items[active] ?? {
    kind: "image" as const,
    src: PLACEHOLDER_IMAGE,
  };
  const total = items.length;

  const go = (dir: 1 | -1) => setActive((i) => (i + dir + total) % total);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-900">
      {/* ── Main viewer ── */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-950">
        {current.kind === "image" ? (
          <Image
            key={current.src}
            src={current.src}
            alt={`${title} – ${active + 1}`}
            fill
            className="object-cover transition-opacity duration-300"
            priority={active === 0}
            sizes="(max-width: 1024px) 100vw, 66vw"
            unoptimized
          />
        ) : (
          <video
            key={current.src}
            src={current.src}
            controls
            className="h-full w-full object-contain"
            playsInline
          />
        )}

        {/* Nav arrows — only when multiple items */}
        {total > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Trước"
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Sau"
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Counter + type indicator */}
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              {current.kind === "video" && (
                <PlayCircle className="h-3.5 w-3.5" />
              )}
              {active + 1} / {total}
            </div>
          </>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto px-3 py-3 scrollbar-hide">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              aria-label={`${item.kind === "video" ? "Video" : "Ảnh"} ${idx + 1}`}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                idx === active
                  ? "border-[#1572D3] shadow-md shadow-blue-400/25"
                  : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {item.kind === "image" ? (
                <Image
                  src={item.src}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized
                />
              ) : (
                /* Video thumbnail: muted preview + play-icon overlay */
                <div className="relative flex h-full w-full items-center justify-center bg-gray-900">
                  <video
                    src={item.src}
                    className="h-full w-full object-cover opacity-70"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <PlayCircle className="h-5 w-5 text-white drop-shadow" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── MetaRow helper ──────────────────────────────────────────── */

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="shrink-0 text-gray-500 dark:text-gray-400">
        {label}:
      </span>
      <span className="flex-1 wrap-break-word text-gray-800 dark:text-gray-200">
        {value}
      </span>
    </div>
  );
}

/* ─── PostDetail ──────────────────────────────────────────────── */

export default function PostDetail({ post }: PostDetailProps) {
  const images =
    post.images && post.images.length > 0 ? post.images : [PLACEHOLDER_IMAGE];
  const videos = post.videos ?? [];

  const expired = isExpired(post.expiredAt);
  const expiryText = formatExpiry(post.expiredAt);

  const handleShare = () => {
    if (typeof navigator !== "undefined") {
      if (navigator.share) {
        navigator
          .share({ title: post.title, url: window.location.href })
          .catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* ── Top bar: back link + share ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#1572D3] dark:text-gray-400 dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách xe
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Share2 className="h-4 w-4" />
            Chia sẻ
          </button>
        </div>

        {/* ── Main 2-column grid ── */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* ── Left: gallery + description ── */}
          <div className="space-y-5 lg:col-span-2">
            {/* Unified gallery handles both images and videos */}
            <Gallery images={images} videos={videos} title={post.title} />

            {/* Description */}
            {post.description && (
              <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-800 dark:text-gray-200">
                  <FileText className="h-4 w-4 text-[#1572D3]" />
                  Mô tả
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {post.description}
                </p>
              </section>
            )}
          </div>

          {/* ── Right: sticky info + contact ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Main info card */}
              <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
                {/* Category + Status row */}
                <div className="flex flex-wrap items-center gap-2">
                  {post.categoryName && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                      <Tag className="h-3 w-3" />
                      {post.categoryName}
                    </span>
                  )}
                  <StatusBadge
                    status={post.status}
                    statusName={post.statusName}
                    size="sm"
                  />
                </div>

                {/* Title */}
                <h1 className="mt-3 text-xl font-extrabold leading-snug text-gray-900 dark:text-gray-100">
                  {post.title}
                </h1>

                {/* Price */}
                <div className="mt-4">
                  <PriceTag price={post.price} size="lg" />
                </div>

                {/* Reject reason — prominent alert box */}
                {post.status === 2 && post.rejectReason && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/30">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <div>
                      <p className="text-xs font-bold text-red-700 dark:text-red-400">
                        Lý do từ chối
                      </p>
                      <p className="mt-0.5 text-sm text-red-600 dark:text-red-300">
                        {post.rejectReason}
                      </p>
                    </div>
                  </div>
                )}

                {/* Meta rows */}
                <div className="mt-5 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                  <MetaRow
                    icon={<Calendar className="h-4 w-4 text-[#1572D3]" />}
                    label="Ngày đăng"
                    value={formatDate(post.createdAt)}
                  />
                  {post.updatedAt && (
                    <MetaRow
                      icon={<Clock className="h-4 w-4 text-gray-400" />}
                      label="Cập nhật"
                      value={formatDate(post.updatedAt)}
                    />
                  )}
                  {post.expiredAt && (
                    <MetaRow
                      icon={
                        <Clock
                          className={`h-4 w-4 ${
                            expired ? "text-red-400" : "text-emerald-500"
                          }`}
                        />
                      }
                      label="Hết hạn"
                      value={
                        <span
                          className={
                            expired
                              ? "font-semibold text-red-500 dark:text-red-400"
                              : "font-semibold text-emerald-600 dark:text-emerald-400"
                          }
                        >
                          {expiryText} ({formatDate(post.expiredAt)})
                        </span>
                      }
                    />
                  )}
                  {post.locationName && (
                    <MetaRow
                      icon={<MapPin className="h-4 w-4 text-[#1572D3]" />}
                      label="Địa điểm"
                      value={post.locationName}
                    />
                  )}
                </div>

                {/* Contact */}
                <div className="mt-5">
                  {post.contactPhone ? (
                    <PhoneRevealButton
                      phoneNumber={post.contactPhone}
                      maskedPhone={
                        post.contactPhone.slice(0, 4) +
                        "****" +
                        post.contactPhone.slice(-3)
                      }
                    />
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                      <Phone className="h-4 w-4" />
                      Không có số liên hệ
                    </div>
                  )}
                </div>
              </div>

              {/* Owner card */}
              {post.ownerName && (
                <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Chủ xe
                  </p>
                  <p className="mt-1.5 font-semibold text-gray-900 dark:text-gray-100">
                    {post.ownerName}
                  </p>
                </div>
              )}

              {/* Safety notice */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-400">
                  <strong>⚠ Lưu ý an toàn:</strong> Luôn xác minh xe và chủ xe
                  trước khi thanh toán. Gặp mặt tại địa điểm công cộng an toàn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
