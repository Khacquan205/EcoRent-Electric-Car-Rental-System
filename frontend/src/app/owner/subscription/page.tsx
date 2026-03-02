"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMySubscriptions,
  type SubscriptionListItem,
} from "@/services/subscription";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Package,
} from "lucide-react";

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

  const active = list.find(
    (s) => s.status === 1 && new Date(s.endDate) > new Date(),
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-slate-500">Đang tải gói...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Gói của tôi
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Xem trạng thái gói và số lượt đăng còn lại.
            </p>
          </div>
          <Link
            href="/owner/owner-packages"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
          >
            <CreditCard className="h-4 w-4" />
            Mua gói mới
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Active Subscription Card */}
        {active && (
          <div className="mt-6 overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-600 p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-100" />
                  <span className="text-sm font-medium text-emerald-100">
                    Gói đang hoạt động
                  </span>
                </div>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  {active.packageName}
                </h2>
              </div>
              <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                Active
              </span>
            </div>

            {/* Posts usage progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-100">Lượt đăng đã sử dụng</span>
                <span className="font-bold text-white">
                  {active.totalPosts - active.remainingPosts} /{" "}
                  {active.totalPosts}
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-2.5 rounded-full bg-white transition-all duration-500"
                  style={{
                    width: `${
                      active.totalPosts > 0
                        ? ((active.totalPosts - active.remainingPosts) /
                            active.totalPosts) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs text-emerald-100">
                Còn lại{" "}
                <strong className="text-white">{active.remainingPosts}</strong>{" "}
                lượt đăng
              </p>
            </div>

            {/* Dates */}
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/20 pt-5">
              <div>
                <p className="text-xs text-emerald-100">Ngày bắt đầu</p>
                <p className="mt-1 font-semibold text-white">
                  {new Date(active.startDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div>
                <p className="text-xs text-emerald-100">Ngày hết hạn</p>
                <p className="mt-1 font-semibold text-white">
                  {new Date(active.endDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!active && list.length === 0 && !error && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Package className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-5 text-base font-semibold text-slate-700">
              Chưa có gói nào
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Mua gói để có thể đăng tin cho thuê xe.
            </p>
            <Link
              href="/owner/owner-packages"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
            >
              <CreditCard className="h-4 w-4" />
              Mua gói ngay
            </Link>
          </div>
        )}

        {/* Subscription History */}
        {list.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-900">
              Lịch sử gói
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tất cả gói bạn đã mua.
            </p>

            <div className="mt-4 space-y-3">
              {list.map((s) => {
                const isActive =
                  s.status === 1 && new Date(s.endDate) > new Date();

                return (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isActive ? "bg-emerald-100" : "bg-slate-100"
                          }`}
                        >
                          {isActive ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {s.packageName}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(s.startDate).toLocaleDateString(
                                "vi-VN",
                              )}
                              {" – "}
                              {new Date(s.endDate).toLocaleDateString("vi-VN")}
                            </span>
                            <span>
                              {s.remainingPosts}/{s.totalPosts} tin còn lại
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isActive
                            ? "border border-emerald-200 bg-emerald-100 text-emerald-700"
                            : "border border-slate-200 bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isActive ? "Đang dùng" : "Hết hạn"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
