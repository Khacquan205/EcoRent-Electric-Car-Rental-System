"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createAdOrder, createAdOrderPaymentUrl, getAdPackages, getMyAdCredits, type AdPackage, type OwnerAdCredit } from "@/services/owner-advertisements";
import { ApiError } from "@/services/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BadgeDollarSign,
  CreditCard,
  Loader2,
  Megaphone,
  Rocket,
  Sparkles,
  RefreshCcw,
} from "lucide-react";

function formatPrice(value?: number) {
  if (value == null) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function priorityLabel(level: number) {
  if (level === 1) return "Thấp";
  if (level === 2) return "Trung bình";
  if (level === 3) return "Cao";
  return `Mức ${level}`;
}

export default function OwnerAdvertisementsPage() {
  const [packages, setPackages] = useState<AdPackage[]>([]);
  const [credits, setCredits] = useState<OwnerAdCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const totalRemainingCredits = useMemo(
    () => credits.reduce((sum, c) => sum + (c.remainingPosts ?? 0), 0),
    [credits],
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [pkgs, myCredits] = await Promise.all([
        getAdPackages(),
        getMyAdCredits(),
      ]);
      setPackages(pkgs ?? []);
      setCredits(myCredits ?? []);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.detail
          : e instanceof Error
            ? e.message
            : "Không thể tải dữ liệu quảng cáo.";
      setMessage({ type: "error", text: msg });
      setPackages([]);
      setCredits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  async function buyPackage(adPackageId: number) {
    setMessage(null);
    setActionLoading(adPackageId);
    try {
      const { adOrderId } = await createAdOrder(adPackageId);
      const { paymentUrl } = await createAdOrderPaymentUrl(adOrderId);
      if (!paymentUrl) {
        setMessage({
          type: "error",
          text: "Không tạo được link thanh toán. Vui lòng thử lại.",
        });
        return;
      }
      window.location.href = paymentUrl;
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.detail
          : e instanceof Error
            ? e.message
            : "Mua gói quảng cáo thất bại.";
      setMessage({ type: "error", text: msg });
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-slate-500">Đang tải gói quảng cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Megaphone className="h-3.5 w-3.5" />
              Trung tâm quảng cáo
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">
              Quảng cáo / Boost bài đăng
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Biến tin đăng của bạn thành tin nổi bật trên EcoRent.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadAll()}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </div>

        {message && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Credits summary */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-sky-100 bg-linear-to-br from-sky-50 via-white to-sky-50 p-6 shadow-sm lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
                  <BadgeDollarSign className="h-3.5 w-3.5" />
                  Credit quảng cáo của bạn
                </div>
                <p className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
                  {totalRemainingCredits}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Tổng lượt boost còn lại (cộng tất cả các gói đang hiệu lực).
                </p>
              </div>
              <Sparkles className="h-10 w-10 text-sky-300" />
            </div>

            {credits.length > 0 ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {credits.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-sky-100 bg-white/70 px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {c.adPackageName}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Thời hạn mỗi lượt: {c.durationDays} ngày
                        </p>
                      </div>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">
                        Còn {c.remainingPosts}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Bạn chưa có credit quảng cáo. Hãy chọn một gói bên dưới để bắt đầu.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-emerald-900">
              Cách dùng quảng cáo hiệu quả
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-emerald-800">
              <li>• Ưu tiên boost những bài có nhiều lượt xem/quan tâm.</li>
              <li>• Dùng gói ưu tiên cao cho dịp Lễ/Tết, cuối tuần.</li>
              <li>• Theo dõi lượt liên hệ sau mỗi chiến dịch.</li>
            </ul>
            <p className="mt-3 text-xs text-emerald-900">
              Sau khi có credit, hãy vào mục{" "}
              <span className="font-semibold">“Thông báo mới”</span> và chọn bài
              để áp dụng quảng cáo.
            </p>
            <Link href="/owner/posts">
              <Button
                size="sm"
                className="mt-4 w-full justify-center bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Rocket className="mr-2 h-4 w-4" />
                Chọn bài để quảng cáo
              </Button>
            </Link>
          </div>
        </div>

        {/* Packages */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Gói quảng cáo</h2>
          <p className="mt-1 text-sm text-slate-500">
            Chọn gói phù hợp, thanh toán qua VNPay.
          </p>

          {packages.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">Chưa có gói nào.</p>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {packages.map((p, index) => {
                const tone =
                  index % 3 === 0
                    ? "from-blue-50 via-white to-blue-50 border-blue-100"
                    : index % 3 === 1
                      ? "from-violet-50 via-white to-violet-50 border-violet-100"
                      : "from-amber-50 via-white to-amber-50 border-amber-100";

                const icon =
                  index % 3 === 0 ? (
                    <Megaphone className="h-5 w-5 text-blue-500" />
                  ) : index % 3 === 1 ? (
                    <Sparkles className="h-5 w-5 text-violet-500" />
                  ) : (
                    <Rocket className="h-5 w-5 text-amber-500" />
                  );

                return (
                  <div
                    key={p.id}
                    className={`group flex flex-col justify-between rounded-2xl border bg-linear-to-br ${tone} p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                          Gói
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {p.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Ưu tiên: {priorityLabel(p.priorityLevel)}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                        {icon}
                      </div>
                    </div>

                    {p.description && (
                      <p className="mt-3 text-sm text-slate-600">
                        {p.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Giá</p>
                        <p className="text-xl font-extrabold text-slate-900">
                          {formatPrice(p.price)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Hạn dùng: {p.durationDays} ngày · {p.maxPosts} lượt
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => void buyPackage(p.id)}
                        disabled={actionLoading === p.id}
                        className="mt-2"
                      >
                        {actionLoading === p.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang tạo...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Mua gói
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

