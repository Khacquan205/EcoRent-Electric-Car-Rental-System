"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  X,
  ZoomIn,
  Star,
  ThumbsUp,
  MessageSquare,
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

/* ─── Fullscreen Lightbox ────────────────────────────────────── */

function Lightbox({
  items,
  active,
  onClose,
  onChangeActive,
}: {
  items: MediaItem[];
  active: number;
  onClose: () => void;
  onChangeActive: (idx: number) => void;
}) {
  const total = items.length;
  const current = items[active];

  const go = useCallback(
    (dir: 1 | -1) => {
      onChangeActive((active + dir + total) % total);
    },
    [active, total, onChangeActive],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [go, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
        aria-label="Đóng"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-20 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
        {active + 1} / {total}
      </div>

      {/* Nav arrows */}
      {total > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25"
            aria-label="Trước"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25"
            aria-label="Sau"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </>
      )}

      {/* Main content */}
      <div className="relative h-[85vh] w-[90vw] max-w-5xl">
        {current.kind === "image" ? (
          <Image
            key={current.src}
            src={current.src}
            alt={`Ảnh ${active + 1}`}
            fill
            className="object-contain"
            sizes="90vw"
            unoptimized
          />
        ) : (
          <video
            key={current.src}
            src={current.src}
            controls
            autoPlay
            className="h-full w-full object-contain"
            playsInline
          />
        )}
      </div>
    </div>
  );
}

/* ─── Mixed-media Gallery (Chợ Tốt style) ────────────────────── */

function Gallery({
  images,
  videos,
  title,
}: {
  images: string[];
  videos: string[];
  title: string;
}) {
  const items: MediaItem[] = [
    ...images.map((src) => ({ kind: "image" as const, src })),
    ...videos.map((src) => ({ kind: "video" as const, src })),
  ];

  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbContainerRef = useRef<HTMLDivElement>(null);

  const current = items[active] ?? {
    kind: "image" as const,
    src: PLACEHOLDER_IMAGE,
  };
  const total = items.length;

  const go = useCallback(
    (dir: 1 | -1) => setActive((i) => (i + dir + total) % total),
    [total],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxOpen) return; // lightbox handles its own keys
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [go, lightboxOpen]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (!thumbContainerRef.current) return;
    const activeThumb = thumbContainerRef.current.children[
      active
    ] as HTMLElement;
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [active]);

  // Touch/swipe support
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      go(diff > 0 ? 1 : -1);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-gray-950 shadow-lg">
        {/* ── Main viewer ── */}
        <div
          className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden bg-gray-950"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => current.kind === "image" && setLightboxOpen(true)}
        >
          {current.kind === "image" ? (
            <Image
              key={current.src}
              src={current.src}
              alt={`${title} – ${active + 1}`}
              fill
              className="object-contain transition-all duration-300"
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
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {/* Zoom hint for images */}
          {current.kind === "image" && total > 0 && (
            <div
              className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100"
              style={{ opacity: 0.7 }}
            >
              <ZoomIn className="h-3.5 w-3.5" />
              Phóng to
            </div>
          )}

          {/* Nav arrows */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label="Ảnh trước"
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg transition-all hover:bg-white hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label="Ảnh sau"
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg transition-all hover:bg-white hover:scale-105 active:scale-95"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Counter badge */}
              <div className="absolute bottom-3 right-3 z-10 rounded-lg bg-black/70 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
                {current.kind === "video" && (
                  <PlayCircle className="mr-1 inline h-3.5 w-3.5" />
                )}
                {active + 1} / {total}
              </div>
            </>
          )}
        </div>

        {/* ── Thumbnail strip ── */}
        {total > 1 && (
          <div className="relative bg-gray-100 dark:bg-gray-900">
            {/* Scroll arrows for thumbnails */}
            <button
              onClick={() => {
                if (thumbContainerRef.current) {
                  thumbContainerRef.current.scrollBy({
                    left: -200,
                    behavior: "smooth",
                  });
                }
              }}
              className="absolute left-0 top-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-r from-gray-100 to-transparent dark:from-gray-900 hover:from-gray-200 dark:hover:from-gray-800 transition"
              aria-label="Cuộn thumbnail trái"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>

            <div
              ref={thumbContainerRef}
              className="flex gap-2 overflow-x-auto px-10 py-3 scrollbar-hide scroll-smooth"
            >
              {items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActive(idx)}
                  aria-label={`${item.kind === "video" ? "Video" : "Ảnh"} ${idx + 1}`}
                  className={`relative h-[68px] w-[96px] shrink-0 overflow-hidden rounded-lg border-[2.5px] transition-all duration-200 ${
                    idx === active
                      ? "border-[#1572D3] shadow-md shadow-blue-500/30 scale-105"
                      : "border-transparent opacity-70 hover:opacity-100 hover:border-gray-300 dark:hover:border-gray-600"
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
                    <div className="relative flex h-full w-full items-center justify-center bg-gray-900">
                      <video
                        src={item.src}
                        className="h-full w-full object-cover opacity-70"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <PlayCircle className="h-5 w-5 text-white drop-shadow" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (thumbContainerRef.current) {
                  thumbContainerRef.current.scrollBy({
                    left: 200,
                    behavior: "smooth",
                  });
                }
              }}
              className="absolute right-0 top-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-l from-gray-100 to-transparent dark:from-gray-900 hover:from-gray-200 dark:hover:from-gray-800 transition"
              aria-label="Cuộn thumbnail phải"
            >
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <Lightbox
          items={items}
          active={active}
          onClose={() => setLightboxOpen(false)}
          onChangeActive={setActive}
        />
      )}
    </>
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

/* ─── Mock Feedback Data ──────────────────────────────────────── */

interface Feedback {
  id: number;
  userName: string;
  avatarUrl: string | null;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

const MOCK_FEEDBACKS: Feedback[] = [
  {
    id: 1,
    userName: "Nguyễn Văn An",
    avatarUrl: null,
    rating: 5,
    comment:
      "Xe rất mới, sạch sẽ và chạy êm. Chủ xe nhiệt tình hỗ trợ, giao xe đúng giờ. Sẽ thuê lại lần sau!",
    createdAt: "2026-02-28T10:30:00",
    helpful: 12,
  },
  {
    id: 2,
    userName: "Trần Thị Mai",
    avatarUrl: null,
    rating: 4,
    comment:
      "Xe ổn, pin đầy khi nhận. Chỉ hơi khó tìm trạm sạc gần điểm trả xe. Nhìn chung hài lòng.",
    createdAt: "2026-02-20T14:15:00",
    helpful: 5,
  },
  {
    id: 3,
    userName: "Lê Hoàng Phúc",
    avatarUrl: null,
    rating: 5,
    comment:
      "Trải nghiệm tuyệt vời! Xe chạy mượt, nội thất sang trọng. Rất phù hợp cho chuyến đi gia đình cuối tuần.",
    createdAt: "2026-02-15T09:00:00",
    helpful: 8,
  },
  {
    id: 4,
    userName: "Phạm Quốc Bảo",
    avatarUrl: null,
    rating: 3,
    comment:
      "Xe tạm ổn, nhưng có vài vết xước nhỏ mà không được thông báo trước. Giao nhận xe khá thuận tiện.",
    createdAt: "2026-02-10T16:45:00",
    helpful: 2,
  },
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const starSize = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
          }`}
        />
      ))}
    </div>
  );
}

function FeedbackSection() {
  const feedbacks = MOCK_FEEDBACKS;
  const avgRating =
    feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
  const totalReviews = feedbacks.length;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: feedbacks.filter((f) => f.rating === star).length,
  }));

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
      <h2 className="flex items-center gap-2 text-base font-bold text-gray-800 dark:text-gray-200">
        <MessageSquare className="h-4 w-4 text-[#1572D3]" />
        Đánh giá từ khách thuê
      </h2>

      {/* Rating summary */}
      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
        {/* Average */}
        <div className="flex flex-col items-center gap-1.5 sm:min-w-[120px]">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
            {avgRating.toFixed(1)}
          </span>
          <StarRating rating={Math.round(avgRating)} size="md" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {totalReviews} đánh giá
          </span>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-1.5">
          {ratingDistribution.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-3 shrink-0 text-right text-gray-600 dark:text-gray-400">
                {star}
              </span>
              <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all"
                  style={{
                    width: totalReviews > 0 ? `${(count / totalReviews) * 100}%` : "0%",
                  }}
                />
              </div>
              <span className="w-5 shrink-0 text-xs text-gray-500 dark:text-gray-400">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback list */}
      <div className="mt-6 divide-y divide-gray-100 dark:divide-gray-800">
        {feedbacks.map((fb) => {
          const initials = fb.userName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(-2)
            .toUpperCase();

          return (
            <div key={fb.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                {fb.avatarUrl ? (
                  <Image
                    src={fb.avatarUrl}
                    alt={fb.userName}
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1572D3]/10 text-sm font-bold text-[#1572D3]">
                    {initials}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Name + rating */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {fb.userName}
                    </span>
                    <StarRating rating={fb.rating} />
                  </div>

                  {/* Date */}
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                    {new Date(fb.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>

                  {/* Comment */}
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {fb.comment}
                  </p>

                  {/* Helpful */}
                  <button className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    Hữu ích ({fb.helpful})
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
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

            {/* Feedback / Reviews */}
            <FeedbackSection />
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
