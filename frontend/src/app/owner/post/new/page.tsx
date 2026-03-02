"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMySubscriptions } from "@/services/subscription";
import { getCategories } from "@/services/categories";
import { createPost } from "@/services/posts";
import type { VehicleCategory } from "@/services/categories";
import type { SubscriptionListItem } from "@/services/subscription";
import { Car, Loader2 } from "lucide-react";
import { uploadImage, uploadVideo } from "@/utils/cloudinaryUpload";

export default function NewPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionListItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCategories(), getMySubscriptions()])
      .then(([cats, subs]) => {
        setCategories(cats);
        setSubscriptions(subs);
        if (cats.length > 0 && categoryId === 0) setCategoryId(cats[0].id);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu"),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeSub = subscriptions.find(
    (s) => s.status === 1 && new Date(s.endDate) > new Date(),
  );
  const canPost = activeSub && activeSub.remainingPosts > 0;

  const totalRequiredFields = 6;
  const completedRequiredFields = [
    categoryId > 0,
    title.trim().length > 0,
    description.trim().length > 0,
    !!imageUrl || !!imagePreview,
    price.trim().length > 0,
    contactPhone.trim().length > 0,
  ].filter(Boolean).length;
  const progressPercent = Math.round(
    (completedRequiredFields / totalRequiredFields) * 100,
  );

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setImageError(null);
    setImageUrl(null);

    if (!file) {
      setImagePreview(null);
      return;
    }

    setImagePreview(URL.createObjectURL(file));

    // #region agent log
    fetch("http://127.0.0.1:7261/ingest/98244a71-f16f-4de1-9d2c-a48f1033456f", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "c89275",
      },
      body: JSON.stringify({
        sessionId: "c89275",
        runId: "pre-fix",
        hypothesisId: "H1",
        location: "owner/post/new/page.tsx:handleImageChange",
        message: "Selected image file",
        data: {
          hasFile: !!file,
          fileType: file.type,
          fileSize: file.size,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);

      // #region agent log
      fetch(
        "http://127.0.0.1:7261/ingest/98244a71-f16f-4de1-9d2c-a48f1033456f",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "c89275",
          },
          body: JSON.stringify({
            sessionId: "c89275",
            runId: "pre-fix",
            hypothesisId: "H2",
            location: "owner/post/new/page.tsx:handleImageChange",
            message: "Image uploaded to Cloudinary",
            data: {
              imageUrlSet: !!url,
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion agent log
    } catch (err) {
      setImageError(
        err instanceof Error
          ? err.message
          : "Không thể tải ảnh lên. Vui lòng thử lại.",
      );
      setImageUrl(null);

      // #region agent log
      fetch(
        "http://127.0.0.1:7261/ingest/98244a71-f16f-4de1-9d2c-a48f1033456f",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "c89275",
          },
          body: JSON.stringify({
            sessionId: "c89275",
            runId: "pre-fix",
            hypothesisId: "H3",
            location: "owner/post/new/page.tsx:handleImageChange",
            message: "Image upload failed",
            data: {
              hasError: true,
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion agent log
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setVideoError(null);
    setVideoFiles(files);

    if (files.length === 0) {
      setVideoPreviews([]);
      return;
    }

    const previews = files.map((file) => URL.createObjectURL(file));
    setVideoPreviews(previews);
  }

  async function handleSubmit(e: React.FormEvent) {
    // #region agent log
    fetch("http://127.0.0.1:7261/ingest/98244a71-f16f-4de1-9d2c-a48f1033456f", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "c89275",
      },
      body: JSON.stringify({
        sessionId: "c89275",
        runId: "pre-fix",
        hypothesisId: "H4",
        location: "owner/post/new/page.tsx:handleSubmit",
        message: "Entered handleSubmit",
        data: {},
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    e.preventDefault();
    if (!canPost) return;
    if (uploadingImage || uploadingVideos) return;

    setError(null);
    setSubmitting(true);
    try {
      const uploadedImageUrl = imageUrl ?? null;
      let uploadedVideoUrls: string[] = [];

      if (videoFiles.length > 0) {
        setVideoError(null);
        setUploadingVideos(true);
        try {
          uploadedVideoUrls = await Promise.all(
            videoFiles.map((file) => uploadVideo(file)),
          );
        } catch (err) {
          setVideoError(
            err instanceof Error
              ? err.message
              : "Không thể tải video lên. Vui lòng thử lại.",
          );
          throw err;
        } finally {
          setUploadingVideos(false);
        }
      }

      const payload: any = {
        categoryId,
        title,
        description: description || undefined,
        price: Number(price) || 0,
        contactPhone: contactPhone || undefined,
      };

      payload.imageUrl = uploadedImageUrl;
      payload.videoUrls = uploadedVideoUrls;

      // #region agent log
      fetch(
        "http://127.0.0.1:7261/ingest/98244a71-f16f-4de1-9d2c-a48f1033456f",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "c89275",
          },
          body: JSON.stringify({
            sessionId: "c89275",
            runId: "pre-fix",
            hypothesisId: "H5",
            location: "owner/post/new/page.tsx:handleSubmit",
            message: "Calling createPost",
            data: {
              hasImageUrlInPayload: !!payload.imageUrl,
              videoUrlCount: uploadedVideoUrls.length,
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion agent log

      await createPost(payload);
      router.push("/owner/posts");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đăng tin thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Page Header */}
      <div className="border-b border-slate-100 bg-white px-6 py-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Car className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Đăng tin cho thuê xe</h1>
        <p className="mt-2 text-base text-slate-500">
          Điền thông tin xe. Tin sẽ ở trạng thái chờ duyệt; slot chỉ trừ khi được duyệt.
        </p>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        {/* No subscription warning */}
        {!canPost && (
          <div className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <p className="font-semibold text-amber-900">
                {!activeSub ? "Bạn chưa có gói hoạt động" : "Bạn đã hết lượt đăng"}
              </p>
              <p className="mt-0.5 text-sm text-amber-700">
                {!activeSub
                  ? "Mua gói trước để có thể đăng tin cho thuê xe."
                  : "Vui lòng nâng cấp gói để tiếp tục đăng tin."}
              </p>
              <Link
                href="/owner/owner-packages"
                className="mt-2 inline-flex items-center gap-1 rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-600"
              >
                Xem gói ngay →
              </Link>
            </div>
          </div>
        )}

        {/* Active subscription info */}
        {activeSub && (
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
            <div>
              <p className="text-sm text-slate-500">Lượt đăng còn lại</p>
              <p className="text-2xl font-bold text-primary">
                {activeSub.remainingPosts}
                <span className="text-base font-normal text-slate-400"> / {activeSub.totalPosts}</span>
              </p>
            </div>
            {activeSub.remainingPosts === 0 && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                Hết slot
              </span>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Progress */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-medium text-slate-600">
              <span>Mức độ hoàn thành tin đăng</span>
              <span className="font-bold text-primary">{progressPercent}%</span>
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Section 1: Basic Info */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
            <h2 className="mb-6 text-lg font-bold text-slate-800">
              📋 Thông tin cơ bản
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Loại xe (danh mục) *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value={0}>-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: VinFast VF 8 cho thuê tại Hà Nội"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Mô tả
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Mô tả chi tiết về xe của bạn..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Media */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
            <h2 className="mb-6 text-lg font-bold text-slate-800">
              🖼️ Hình ảnh &amp; Video
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Ảnh minh họa
                </label>
                <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:border-primary hover:bg-primary/5">
                  <span className="text-2xl">📷</span>
                  <span className="text-sm text-slate-600">Chọn ảnh từ thiết bị</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {uploadingImage && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="h-3 w-3 animate-spin" /> Đang tải ảnh lên...
                  </p>
                )}
                {imageError && (
                  <p className="mt-2 text-xs text-red-600">{imageError}</p>
                )}
                {imagePreview && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                    <img
                      src={imagePreview}
                      alt="Xem trước ảnh"
                      className="h-56 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Video minh họa{" "}
                  <span className="font-normal text-slate-400">(tùy chọn)</span>
                </label>
                <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:border-primary hover:bg-primary/5">
                  <span className="text-2xl">🎥</span>
                  <span className="text-sm text-slate-600">Chọn video từ thiết bị (nhiều file)</span>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </label>
                {uploadingVideos && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="h-3 w-3 animate-spin" /> Đang tải video lên...
                  </p>
                )}
                {videoError && (
                  <p className="mt-2 text-xs text-red-600">{videoError}</p>
                )}
                {videoPreviews.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {videoPreviews.map((src, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <video
                          src={src}
                          className="h-20 w-36 rounded-xl object-cover"
                          controls
                        />
                        <span className="flex-1 truncate text-sm text-slate-700">
                          {videoFiles[index]?.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & Contact */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
            <h2 className="mb-6 text-lg font-bold text-slate-800">
              💰 Giá &amp; Liên hệ
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Giá thuê (₫/ngày) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="VD: 800000"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Số điện thoại liên hệ
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="VD: 0901234567"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pb-10">
            <button
              type="submit"
              disabled={
                !canPost ||
                submitting ||
                uploadingImage ||
                (activeSub?.remainingPosts ?? 0) === 0
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-white shadow-md transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Car className="h-5 w-5" />
              )}
              {submitting ? "Đang đăng tin..." : "Đăng tin ngay"}
            </button>
            <Link
              href="/owner/posts"
              className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
