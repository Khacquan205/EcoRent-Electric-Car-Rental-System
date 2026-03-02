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
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        Đăng tin cho thuê xe
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Điền thông tin xe. Tin sẽ ở trạng thái chờ duyệt; slot chỉ trừ khi được
        duyệt.
      </p>

      {!canPost && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {!activeSub
            ? "Bạn cần có gói đang hoạt động. Mua gói trước khi đăng tin."
            : "Bạn đã hết lượt đăng trong gói hiện tại."}
          <Link
            href="/owner/packages"
            className="mt-2 block font-medium text-amber-900 underline"
          >
            Mua gói →
          </Link>
        </div>
      )}

      {activeSub && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">
            Số tin còn có thể đăng:{" "}
            <strong className="text-lg text-primary">
              {activeSub.remainingPosts}
            </strong>
            {" / "}
            {activeSub.totalPosts}
          </p>
          {activeSub.remainingPosts === 0 && (
            <p className="mt-1 text-xs text-amber-700">
              Hết slot. Chỉ trừ slot khi tin được duyệt.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Loại xe (danh mục) *
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
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
          <label className="block text-sm font-medium text-slate-700">
            Tiêu đề *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: VinFast VF 8 cho thuê"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Mô tả
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Ảnh minh họa
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
          {uploadingImage && (
            <p className="mt-1 text-xs text-slate-500">
              Đang tải ảnh lên Cloudinary...
            </p>
          )}
          {imageError && (
            <p className="mt-1 text-xs text-red-600">{imageError}</p>
          )}
          {imagePreview && (
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img
                src={imagePreview}
                alt="Xem trước ảnh"
                className="h-48 w-full object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Video minh họa
          </label>
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={handleVideoChange}
            className="mt-1 w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
          {uploadingVideos && (
            <p className="mt-1 text-xs text-slate-500">
              Đang tải video lên Cloudinary...
            </p>
          )}
          {videoError && (
            <p className="mt-1 text-xs text-red-600">{videoError}</p>
          )}
          {videoPreviews.length > 0 && (
            <ul className="mt-3 space-y-2">
              {videoPreviews.map((src, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2"
                >
                  <video
                    src={src}
                    className="h-20 w-32 rounded-md object-cover"
                    controls
                  />
                  <span className="flex-1 truncate text-xs text-slate-700">
                    {videoFiles[index]?.name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Giá thuê (₫/ngày) *
          </label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Số điện thoại liên hệ
          </label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={
              !canPost ||
              submitting ||
              uploadingImage ||
              (activeSub?.remainingPosts ?? 0) === 0
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Car className="h-4 w-4" />
            )}
            {submitting ? "Đang đăng..." : "Đăng tin"}
          </button>
          <Link
            href="/owner/posts"
            className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}
