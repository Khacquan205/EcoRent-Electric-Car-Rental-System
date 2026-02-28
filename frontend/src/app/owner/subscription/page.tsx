"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMySubscriptions, type SubscriptionListItem } from "@/services/subscription";
import { Package, CreditCard } from "lucide-react";

export default function OwnerSubscriptionPage() {
  const [list, setList] = useState<SubscriptionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMySubscriptions()
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : "Lỗi tải gói"))
      .finally(() => setLoading(false));
  }, []);

  const active = list.find((s) => s.status === 1 && new Date(s.endDate) > new Date());

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Gói của tôi</h1>
      <p className="mt-1 text-sm text-slate-600">Xem trạng thái gói và số lượt đăng còn lại.</p>

      {active && (
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
          <p className="text-sm font-medium text-emerald-800">Gói đang dùng</p>
          <p className="mt-1 text-lg font-semibold text-emerald-900">{active.packageName}</p>
          <p className="mt-2 text-sm text-emerald-700">
            Còn lại: <strong>{active.remainingPosts}</strong> / {active.totalPosts} tin
          </p>
          <p className="mt-1 text-xs text-emerald-600">
            Hết hạn: {new Date(active.endDate).toLocaleDateString("vi-VN")}
          </p>
        </div>
      )}

      {!active && list.length === 0 && !error && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 font-medium text-slate-700">Chưa có gói nào</p>
          <p className="mt-1 text-sm text-slate-500">Mua gói để được đăng tin cho thuê xe.</p>
          <Link
            href="/owner/packages"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <CreditCard className="h-4 w-4" />
            Mua gói
          </Link>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {list.length > 0 && (
        <ul className="mt-8 space-y-4">
          {list.map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <p className="font-medium text-slate-900">{s.packageName}</p>
                <p className="text-xs text-slate-500">
                  {s.statusName} · {s.remainingPosts}/{s.totalPosts} tin
                </p>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(s.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <Link href="/owner/packages" className="text-sm font-medium text-primary hover:underline">
          ← Mua gói mới
        </Link>
      </div>
    </div>
  );
}
