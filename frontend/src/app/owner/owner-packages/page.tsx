"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getActivePackages } from "@/services/packages";
import { getMySubscriptions } from "@/services/subscription";
import { createSubscription } from "@/services/subscription";
import { createPaymentUrl } from "@/services/payment";
import type { OwnerPackage } from "@/services/packages";
import { Check, CreditCard, Crown, Loader2, Lock, Zap } from "lucide-react";

export default function OwnerPackagesPage() {
  const [packages, setPackages] = useState<OwnerPackage[]>([]);
  const [subscriptions, setSubscriptions] = useState<
    Awaited<ReturnType<typeof getMySubscriptions>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getActivePackages(), getMySubscriptions()])
      .then(([pkgs, subs]) => {
        setPackages(pkgs);
        setSubscriptions(subs);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Lỗi tải gói"))
      .finally(() => setLoading(false));
  }, []);

  const activeSub = subscriptions.find(
    (s) => s.status === 1 && new Date(s.endDate) > new Date(),
  );
  const lockedPackageIds = activeSub ? [activeSub.packageId] : [];
  const hasActiveSubscription = !!activeSub;
  // If all post slots are used up, unlock the package grid so the owner can buy a new plan
  const postsExhausted =
    hasActiveSubscription && activeSub!.remainingPosts === 0;

  async function handleBuy(pkg: OwnerPackage) {
    if (lockedPackageIds.includes(pkg.id)) return;
    if (hasActiveSubscription && !postsExhausted) {
      setError(
        "Bạn vẫn còn tin đăng. Chỉ có thể mua gói mới khi dùng hết số tin hiện tại.",
      );
      return;
    }
    setError(null);
    setPayingId(pkg.id);
    try {
      const sub = await createSubscription({
        packageId: pkg.id,
        source: "Web",
      });
      const { paymentUrl } = await createPaymentUrl(sub.id);
      window.location.href = paymentUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tạo thanh toán thất bại");
      setPayingId(null);
    }
  }

  const sortedByPriority = [...packages].sort(
    (a, b) => b.priorityLevel - a.priorityLevel,
  );
  const recommendedId =
    sortedByPriority.length > 0 ? sortedByPriority[0].id : null;

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
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Mua gói đăng tin
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Chọn gói phù hợp với nhu cầu của bạn. Thanh toán an toàn qua VNPay.
          </p>
        </div>

        {/* Active subscription banner */}
        {hasActiveSubscription && !postsExhausted && (
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <Check className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-emerald-800">
                  Đang sử dụng:{" "}
                  <span className="text-emerald-900">
                    {activeSub?.packageName}
                  </span>
                </p>
                <p className="text-xs text-emerald-600">
                  Hết hạn:{" "}
                  {activeSub &&
                    new Date(activeSub.endDate).toLocaleDateString("vi-VN")}
                  {" · "}
                  {activeSub?.remainingPosts}/{activeSub?.totalPosts} tin còn
                  lại
                </p>
              </div>
              <Link
                href="/owner/subscription"
                className="shrink-0 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-800 transition-colors duration-200 hover:bg-emerald-200"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        )}

        {/* Posts-exhausted banner — prompt to buy a new plan */}
        {postsExhausted && (
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <Zap className="h-4 w-4 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-amber-800">
                  Bạn đã dùng hết{" "}
                  <span className="text-amber-900">
                    {activeSub?.totalPosts} tin đăng
                  </span>{" "}
                  của gói{" "}
                  <span className="text-amber-900">
                    {activeSub?.packageName}
                  </span>
                </p>
                <p className="text-xs text-amber-600">
                  Chọn một gói bên dưới để tiếp tục đăng tin mới.
                </p>
              </div>
              <Link
                href="/owner/subscription"
                className="shrink-0 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 transition-colors duration-200 hover:bg-amber-200"
              >
                Xem lịch sử
              </Link>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Packages Grid */}
        {packages.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => {
              const isCurrentPackage = lockedPackageIds.includes(pkg.id);
              // Lock the current package card; only lock others when sub still has remaining posts
              const isLocked =
                isCurrentPackage || (hasActiveSubscription && !postsExhausted);
              const isRecommended = pkg.id === recommendedId;

              return (
                <div
                  key={pkg.id}
                  className={`relative flex flex-col rounded-2xl border p-6 shadow-sm transition-all duration-200 ${
                    isRecommended && !isLocked
                      ? "border-primary/40 bg-white ring-2 ring-primary/20 hover:shadow-lg"
                      : isLocked
                        ? "border-slate-200 bg-slate-50 opacity-85"
                        : "border-slate-200 bg-white hover:border-primary/30 hover:shadow-md"
                  }`}
                >
                  {/* Recommended badge */}
                  {isRecommended && !isLocked && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                        <Zap className="h-3 w-3" />
                        Phổ biến nhất
                      </span>
                    </div>
                  )}

                  {/* Current package badge */}
                  {isCurrentPackage && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700">
                        Gói hiện tại
                      </span>
                    </div>
                  )}

                  {/* Locked: active sub still has remaining posts */}
                  {isLocked && !isCurrentPackage && (
                    <div className="mb-4 text-xs text-slate-400">
                      Có thể mua khi dùng hết tin hoặc gói hết hạn
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isRecommended && !isLocked
                        ? "bg-primary/10"
                        : "bg-slate-100"
                    }`}
                  >
                    <Crown
                      className={`h-5 w-5 ${
                        isRecommended && !isLocked
                          ? "text-primary"
                          : "text-slate-400"
                      }`}
                    />
                  </div>

                  {/* Name */}
                  <h2 className="mt-4 text-xl font-semibold text-slate-900">
                    {pkg.name}
                  </h2>

                  {/* Price */}
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-slate-900">
                      {Number(pkg.price).toLocaleString("vi-VN")}
                    </span>
                    <span className="ml-1 text-sm text-slate-400">₫</span>
                  </div>

                  {/* Features */}
                  <ul className="mt-6 flex-1 space-y-3">
                    <li className="flex items-center gap-2.5 text-sm text-slate-600">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <Check className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span>{pkg.durationDays} ngày sử dụng</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-sm text-slate-600">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <Check className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span>Tối đa {pkg.maxPosts} tin đăng</span>
                    </li>
                    <li className="flex items-center gap-2.5 text-sm text-slate-600">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <Check className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span>Ưu tiên hiển thị cấp {pkg.priorityLevel}</span>
                    </li>
                  </ul>

                  {/* CTA */}
                  <button
                    type="button"
                    disabled={!!payingId || isLocked}
                    onClick={() => handleBuy(pkg)}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                      isRecommended && !isLocked
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md"
                        : isLocked
                          ? "bg-slate-100 text-slate-400"
                          : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md"
                    }`}
                  >
                    {payingId === pkg.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    {payingId === pkg.id
                      ? "Đang chuyển VNPay..."
                      : isCurrentPackage
                        ? "Gói hiện tại"
                        : hasActiveSubscription && !postsExhausted
                          ? "Hết tin mới mua được"
                          : "Thanh toán VNPay"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          !error && (
            <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Crown className="h-8 w-8 text-slate-300" />
              </div>
              <p className="mt-4 font-semibold text-slate-600">
                Chưa có gói nào
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Liên hệ quản trị viên để thêm gói.
              </p>
            </div>
          )
        )}

        <div className="mt-10 text-center">
          <Link
            href="/owner/subscription"
            className="text-sm font-medium text-primary transition-colors duration-200 hover:text-primary/80 hover:underline"
          >
            ← Xem gói đang dùng
          </Link>
        </div>
      </div>
    </div>
  );
}
