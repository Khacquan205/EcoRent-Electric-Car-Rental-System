"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  applyAdToPost,
  createAdOrder,
  createAdOrderPaymentUrl,
  getAdPackages,
  getMyAdCredits,
  type AdPackage,
  type OwnerAdCredit,
} from "@/services/owner-advertisements";
import { ApiError } from "@/services/client";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, Megaphone, RefreshCcw } from "lucide-react";

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

  // Small helper for manual testing: apply credit to a post ID.
  // This avoids blocking UI while owner/posts page is being wired.
  const [testPostId, setTestPostId] = useState<string>("");
  async function applyToPost() {
    setMessage(null);
    const id = Number(testPostId);
    if (!Number.isFinite(id) || id <= 0) {
      setMessage({ type: "error", text: "PostId không hợp lệ." });
      return;
    }
    setActionLoading(-1);
    try {
      const res = await applyAdToPost(id);
      setMessage({ type: "success", text: res.message || "Áp dụng thành công." });
      await loadAll();
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.detail
          : e instanceof Error
            ? e.message
            : "Áp dụng quảng cáo thất bại.";
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
            <h1 className="text-2xl font-semibold text-slate-900">
              Quảng cáo / Boost bài đăng
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Mua gói quảng cáo và dùng credit để ưu tiên hiển thị bài đăng.
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                <Megaphone className="h-3.5 w-3.5" />
                Credit quảng cáo của bạn
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {totalRemainingCredits}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Tổng lượt boost còn lại (cộng tất cả gói).
              </p>
            </div>
          </div>

          {credits.length > 0 ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {credits.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {c.adPackageName}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Thời hạn: {c.durationDays} ngày
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900">
                      Còn {c.remainingPosts}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Bạn chưa có credit quảng cáo. Hãy mua gói bên dưới.
            </p>
          )}
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
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {p.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Ưu tiên: {priorityLabel(p.priorityLevel)}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {p.maxPosts} lượt
                    </span>
                  </div>

                  {p.description && (
                    <p className="mt-3 text-sm text-slate-600">
                      {p.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Giá</p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatPrice(p.price)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Hạn dùng: {p.durationDays} ngày
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => void buyPackage(p.id)}
                      disabled={actionLoading === p.id}
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
              ))}
            </div>
          )}
        </div>

        {/* Manual apply (temporary helper) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Áp dụng quảng cáo cho bài (PostId)
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Nhập PostId của bài đã duyệt để dùng 1 credit boost.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={testPostId}
              onChange={(e) => setTestPostId(e.target.value)}
              placeholder="Ví dụ: 123"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
            />
            <Button
              onClick={() => void applyToPost()}
              disabled={actionLoading === -1}
            >
              {actionLoading === -1 ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang áp dụng...
                </>
              ) : (
                "Áp dụng"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

