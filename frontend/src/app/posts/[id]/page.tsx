"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
} from "lucide-react";
import { getPostDetail } from "@/services/posts";
import type { PostDetail } from "@/services/posts";
import { PhoneRevealButton } from "@/components/cars/PhoneRevealButton";
import { notFound } from "next/navigation";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=500&fit=crop";

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "₫";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function PostDetailPage() {
  const params = useParams();
  const id = Number(params?.id);

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id || isNaN(id)) {
      notFound();
      return;
    }
    getPostDetail(id)
      .then((data) => setPost(data))
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Không tải được bài đăng";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1572D3] border-t-transparent" />
          <p className="text-sm text-slate-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
        <h2 className="text-2xl font-semibold text-slate-700">
          Không tìm thấy bài đăng
        </h2>
        <p className="text-slate-500">
          {error ?? "Bài đăng không tồn tại hoặc đã bị xóa."}
        </p>
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1572D3] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1260B0]"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const images: string[] =
    post.images && post.images.length > 0 ? post.images : [PLACEHOLDER_IMAGE];
  const videos: string[] = post.videos ?? [];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="container mx-auto px-4 py-8 sm:px-6">
        {/* Back */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#747474] transition-colors hover:text-[#1572D3]"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách xe
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {/* ─── Left: Gallery + Info ─── */}
          <div className="space-y-6 lg:col-span-2">
            {/* Image Gallery */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {/* Main image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <Image
                  src={images[activeImage]}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                  unoptimized
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImage(
                          (i) => (i - 1 + images.length) % images.length,
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImage((i) => (i + 1) % images.length)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-4 right-4 rounded-lg bg-black/60 px-3 py-1 text-sm text-white">
                      {activeImage + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                        idx === activeImage
                          ? "border-[#1572D3]"
                          : "border-transparent hover:border-slate-300"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Ảnh ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {post.description && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[#242424]">Mô tả</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#747474]">
                  {post.description}
                </p>
              </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#242424]">
                  <PlayCircle className="h-5 w-5 text-[#1572D3]" />
                  Video
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {videos.map((src, idx) => (
                    <video
                      key={idx}
                      src={src}
                      controls
                      className="w-full rounded-xl bg-black"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Right: Price & Contact ─── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Price Card */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                {/* Category badge */}
                {post.categoryName && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F4FD] px-2.5 py-1 text-xs font-semibold text-[#1572D3]">
                    <Tag className="h-3 w-3" />
                    {post.categoryName}
                  </span>
                )}

                {/* Title */}
                <h1 className="mt-3 text-xl font-bold text-[#242424]">
                  {post.title}
                </h1>

                {/* Price */}
                <div className="mt-4">
                  <p className="text-3xl font-bold text-[#1572D3]">
                    {formatPrice(post.price)}
                    <span className="text-base font-normal text-[#747474]">
                      /ngày
                    </span>
                  </p>
                </div>

                {/* Dates */}
                <div className="mt-4 space-y-2 text-sm text-[#747474]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#1572D3]" />
                    <span>Đăng lúc: {formatDate(post.createdAt)}</span>
                  </div>
                  {post.expiredAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>Hết hạn: {formatDate(post.expiredAt)}</span>
                    </div>
                  )}
                  {post.locationName && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#1572D3]" />
                      <span>{post.locationName}</span>
                    </div>
                  )}
                </div>

                {/* Contact */}
                {post.contactPhone ? (
                  <div className="mt-5">
                    <PhoneRevealButton
                      phoneNumber={post.contactPhone}
                      maskedPhone={
                        post.contactPhone.slice(0, 4) +
                        "****" +
                        post.contactPhone.slice(-3)
                      }
                    />
                  </div>
                ) : (
                  <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    <Phone className="h-4 w-4" />
                    Không có số liên hệ
                  </div>
                )}
              </div>

              {/* Owner Card */}
              {post.ownerName && (
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Chủ xe
                  </p>
                  <p className="mt-1 font-semibold text-[#242424]">
                    {post.ownerName}
                  </p>
                </div>
              )}

              {/* Safety Notice */}
              <div className="rounded-xl bg-[#FFF8E6] p-4">
                <p className="text-xs text-[#996600]">
                  <strong>Lưu ý an toàn:</strong> Luôn xác minh xe và chủ xe
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
