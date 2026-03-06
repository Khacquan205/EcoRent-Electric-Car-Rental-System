"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  verifyVnPayReturn,
  type PaymentReturnResult,
} from "@/services/payment";
import { CheckCircle2, XCircle } from "lucide-react";

function VnPayReturnContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<PaymentReturnResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      if (Object.keys(params).length === 0) {
        return {
          success: false,
          message: "Không có dữ liệu từ VNPay",
        } as PaymentReturnResult;
      }
      return verifyVnPayReturn(params);
    };
    verify()
      .then(setResult)
      .catch((e) =>
        setResult({
          success: false,
          message: e instanceof Error ? e.message : "Xác thực thất bại",
        }),
      )
      .finally(() => setLoading(false));
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Đang xác thực thanh toán...</p>
      </div>
    );
  }

  const success = result?.success ?? false;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {success ? (
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
        ) : (
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
        )}
        <h1 className="mt-4 text-xl font-semibold text-slate-900">
          {success ? "Thanh toán thành công" : "Thanh toán thất bại"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{result?.message}</p>

        {success &&
          (result?.transactionId ||
            result?.amount != null ||
            result?.payDate) && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Thông tin giao dịch
              </p>
              {result?.orderId && (
                <p className="text-sm text-slate-700">
                  <span className="text-slate-500">Mã đơn:</span>{" "}
                  {result.orderId}
                </p>
              )}
              {result?.transactionId && (
                <p className="mt-1 text-sm text-slate-700">
                  <span className="text-slate-500">Mã GD:</span>{" "}
                  {result.transactionId}
                </p>
              )}
              {result?.amount != null && (
                <p className="mt-1 text-sm text-slate-700">
                  <span className="text-slate-500">Số tiền:</span>{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(result.amount)}
                </p>
              )}
              {result?.payDate && (
                <p className="mt-1 text-sm text-slate-700">
                  <span className="text-slate-500">Ngày thanh toán:</span>{" "}
                  {new Date(result.payDate).toLocaleString("vi-VN")}
                </p>
              )}
            </div>
          )}

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/owner/subscription"
            className="rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Xem gói của tôi
          </Link>
          <Link
            href="/owner/post/new"
            className="text-sm text-primary hover:underline"
          >
            Đăng tin xe
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VnPayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">Đang tải trang thanh toán...</p>
        </div>
      }
    >
      <VnPayReturnContent />
    </Suspense>
  );
}
