"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMySubscriptions } from "@/services/subscription";
import { getCategories } from "@/services/categories";
import { createPost } from "@/services/posts";
import type { VehicleCategory } from "@/services/categories";
import type { SubscriptionListItem } from "@/services/subscription";
import { Car, Loader2, X, ImagePlus } from "lucide-react";
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

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const MAX_IMAGES = 10;

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
    imageUrls.length > 0 || imagePreviews.length > 0,
    price.trim().length > 0,
    contactPhone.trim().length > 0,
  ].filter(Boolean).length;
  const progressPercent = Math.round(
    (completedRequiredFields / totalRequiredFields) * 100,
  );

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setImageError(null);

    if (files.length === 0) return;

    const totalAfterAdd = imagePreviews.length + files.length;
    if (totalAfterAdd > MAX_IMAGES) {
      setImageError(`Tối đa ${MAX_IMAGES} ảnh. Bạn đã chọn ${imagePreviews.length}, không thể thêm ${files.length} ảnh nữa.`);
      return;
    }

    // Create previews immediately
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // Upload all new files to Cloudinary in parallel
    setUploadingImages(true);
    try {
      const urls = await Promise.all(files.map((file) => uploadImage(file)));
      setImageUrls((prev) => [...prev, ...urls]);
    } catch (err) {
      setImageError(
        err instanceof Error
          ? err.message
          : "Không thể tải ảnh lên. Vui lòng thử lại.",
      );
      // Roll back previews for failed batch
      setImageFiles((prev) => prev.slice(0, prev.length - files.length));
      setImagePreviews((prev) => {
        const rolled = prev.slice(0, prev.length - newPreviews.length);
        newPreviews.forEach((u) => URL.revokeObjectURL(u));
        return rolled;
      });
    } finally {
      setUploadingImages(false);
      // Reset the input so choosing the same files again triggers onChange
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
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
    e.preventDefault();
    if (!canPost) return;
    if (uploadingImages || uploadingVideos) return;

    setError(null);
    setSubmitting(true);
    try {
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

      payload.imageUrls = imageUrls.length > 0 ? imageUrls : undefined;
      payload.videoUrls = uploadedVideoUrls.length > 0 ? uploadedVideoUrls : undefined;

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
        <h1 className="text-3xl font-bold text-slate-900">
          Đăng tin cho thuê xe
        </h1>
        <p className="mt-2 text-base text-slate-500">
          Điền thông tin xe. Tin sẽ ở trạng thái chờ duyệt; slot chỉ trừ khi
          được duyệt.
        </p>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[120px_1fr] lg:items-start">
          <div className="space-y-6 lg:order-2">
            {/* No subscription warning */}
            {!canPost && (
              <div className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <p className="font-semibold text-amber-900">
                    {!activeSub
                      ? "Bạn chưa có gói hoạt động"
                      : "Bạn đã hết lượt đăng"}
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
                    <span className="text-base font-normal text-slate-400">
                      {" "}
                      / {activeSub.totalPosts}
                    </span>
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

            {/* Progress for mobile */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:hidden">
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

            <form onSubmit={handleSubmit} className="space-y-6">

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
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-700">
                    Ảnh minh họa
                  </label>
                  <span className="text-xs text-slate-400">
                    {imagePreviews.length}/{MAX_IMAGES} ảnh
                  </span>
                </div>
                <label className={`mt-2 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 transition-colors ${
                  imagePreviews.length >= MAX_IMAGES
                    ? "border-slate-100 bg-slate-50 cursor-not-allowed opacity-50"
                    : "border-slate-200 bg-slate-50 hover:border-primary hover:bg-primary/5"
                }`}>
                  <ImagePlus className="h-6 w-6 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {imagePreviews.length >= MAX_IMAGES
                      ? `Đã đạt giới hạn ${MAX_IMAGES} ảnh`
                      : "Chọn ảnh từ thiết bị (có thể chọn nhiều ảnh)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={imagePreviews.length >= MAX_IMAGES}
                    className="hidden"
                  />
                </label>
                {uploadingImages && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="h-3 w-3 animate-spin" /> Đang tải ảnh lên Cloudinary...
                  </p>
                )}
                {imageError && (
                  <p className="mt-2 text-xs text-red-600">{imageError}</p>
                )}
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {imagePreviews.map((src, index) => (
                      <div
                        key={index}
                        className="group relative overflow-hidden rounded-xl border border-slate-200"
                      >
                        <img
                          src={src}
                          alt={`Ảnh ${index + 1}`}
                          className="h-36 w-full object-cover"
                        />
                        {/* Upload status indicator */}
                        {index >= imageUrls.length && uploadingImages && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        )}
                        {/* Index badge */}
                        <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {index + 1}
                        </span>
                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/90 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-red-600"
                          title="Xóa ảnh"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
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
                  <span className="text-sm text-slate-600">
                    Chọn video từ thiết bị (nhiều file)
                  </span>
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
                    <Loader2 className="h-3 w-3 animate-spin" /> Đang tải video
                    lên...
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
                uploadingImages ||
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

          {/* Sticky vertical progress for desktop */}
          <aside className="sticky top-24 hidden h-fit lg:order-1 lg:block">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Hoàn thành
              </p>
              <p className="mt-1 text-center text-lg font-bold text-primary">
                {progressPercent}%
              </p>
              <div className="mt-4 flex justify-center">
                <div className="relative h-72 w-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="absolute bottom-0 left-0 w-full rounded-full bg-primary transition-all duration-300 ease-out"
                    style={{ height: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <p className="mt-4 text-center text-[11px] text-slate-400">
                Tự động theo cuộn
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
