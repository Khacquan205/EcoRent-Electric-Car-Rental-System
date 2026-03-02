"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMySubscriptions } from "@/services/subscription";
import { getCategories } from "@/services/categories";
import { createPost } from "@/services/posts";
import type { VehicleCategory } from "@/services/categories";
import type { SubscriptionListItem } from "@/services/subscription";
import {
  AlertCircle,
  ArrowLeft,
  Car,
  CheckCircle2,
  Loader2,
} from "lucide-react";

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
  }, []);

  const activeSub = subscriptions.find(
    (s) => s.status === 1 && new Date(s.endDate) > new Date(),
  );
  const canPost = activeSub && activeSub.remainingPosts > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canPost) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await createPost({
        categoryId,
        title,
        description: description || undefined,
        price: Number(price) || 0,
        contactPhone: contactPhone || undefined,
      });
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
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Back navigation */}
        <Link
          href="/owner/posts"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách tin
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              {/* Card Header */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Đăng tin cho thuê xe
                  </h1>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Tin sẽ chờ duyệt trước khi hiển thị. Slot chỉ trừ khi được
                    duyệt.
                  </p>
                </div>
              </div>

              {/* Error alert */}
              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* No subscription / no slots warning */}
              {!canPost && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm text-amber-800">
                      {!activeSub
                        ? "Bạn cần có gói đang hoạt động để đăng tin."
                        : "Bạn đã hết lượt đăng trong gói hiện tại."}
                    </p>
                    <Link
                      href="/owner/owner-packages"
                      className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-amber-900 hover:underline"
                    >
                      Mua gói ngay →
                    </Link>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Section: Thông tin xe */}
                <div className="space-y-5">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Thông tin xe
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Loại xe (danh mục) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                      Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="VD: VinFast VF 8 cho thuê giá rẻ"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                      rows={4}
                      placeholder="Mô tả chi tiết về xe, điều kiện thuê..."
                      className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                {/* Section: Giá & liên hệ */}
                <div className="space-y-5">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Giá &amp; liên hệ
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Giá thuê (₫ / ngày){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        type="number"
                        min={0}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="500000"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-16 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        ₫/ngày
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Số điện thoại liên hệ
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="0901234567"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 border-t border-slate-100 pt-6">
                  <button
                    type="submit"
                    disabled={
                      !canPost ||
                      submitting ||
                      (activeSub?.remainingPosts ?? 0) === 0
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Car className="h-4 w-4" />
                    )}
                    {submitting ? "Đang đăng tin..." : "Đăng tin"}
                  </button>
                  <Link
                    href="/owner/posts"
                    className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
                  >
                    Hủy
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Subscription status */}
            {activeSub ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-800">
                    Gói đang dùng
                  </p>
                </div>
                <p className="mt-2 font-semibold text-emerald-900">
                  {activeSub.packageName}
                </p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-emerald-700">
                    <span>Lượt đăng còn lại</span>
                    <span className="font-bold">
                      {activeSub.remainingPosts} / {activeSub.totalPosts}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-emerald-200">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${
                          activeSub.totalPosts > 0
                            ? (activeSub.remainingPosts /
                                activeSub.totalPosts) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <p className="mt-3 text-xs text-emerald-600">
                  Hết hạn:{" "}
                  {new Date(activeSub.endDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
                <p className="text-sm font-semibold text-amber-800">
                  Chưa có gói
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  Bạn cần mua gói trước khi đăng tin.
                </p>
                <Link
                  href="/owner/owner-packages"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-amber-700"
                >
                  Mua gói ngay
                </Link>
              </div>
            )}

            {/* Tips card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-700">
                Lưu ý khi đăng tin
              </p>
              <ul className="mt-3 space-y-2.5 text-xs text-slate-500">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  Tin sẽ được duyệt trong vòng 24 giờ
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  Slot chỉ bị trừ khi tin được duyệt
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  Đảm bảo thông tin xe chính xác
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  Hình ảnh rõ ràng giúp tăng lượt thuê
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
