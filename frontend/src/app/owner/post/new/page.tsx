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

export default function NewPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionListItem[]>([]);
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
      .catch((e) => setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  const activeSub = subscriptions.find(
    (s) => s.status === 1 && new Date(s.endDate) > new Date()
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
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Đăng tin cho thuê xe</h1>
      <p className="mt-1 text-sm text-slate-600">
        Điền thông tin xe. Tin sẽ ở trạng thái chờ duyệt; slot chỉ trừ khi được duyệt.
      </p>

      {!canPost && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {!activeSub
            ? "Bạn cần có gói đang hoạt động. Mua gói trước khi đăng tin."
            : "Bạn đã hết lượt đăng trong gói hiện tại."}
          <Link href="/owner/packages" className="mt-2 block font-medium text-amber-900 underline">
            Mua gói →
          </Link>
        </div>
      )}

      {activeSub && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">
            Số tin còn có thể đăng:{" "}
            <strong className="text-lg text-primary">{activeSub.remainingPosts}</strong>
            {" / "}
            {activeSub.totalPosts}
          </p>
          {activeSub.remainingPosts === 0 && (
            <p className="mt-1 text-xs text-amber-700">Hết slot. Chỉ trừ slot khi tin được duyệt.</p>
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
          <label className="block text-sm font-medium text-slate-700">Loại xe (danh mục) *</label>
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
          <label className="block text-sm font-medium text-slate-700">Tiêu đề *</label>
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
          <label className="block text-sm font-medium text-slate-700">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Giá thuê (₫/ngày) *</label>
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
          <label className="block text-sm font-medium text-slate-700">Số điện thoại liên hệ</label>
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
            disabled={!canPost || submitting || (activeSub?.remainingPosts ?? 0) === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Car className="h-4 w-4" />}
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
