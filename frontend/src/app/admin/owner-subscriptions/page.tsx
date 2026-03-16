"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import {
  getAdminOwnerSubscriptions,
  type OwnerSubscription,
} from "@/services/admin-owner-subscriptions";
import { Button } from "@/components/ui/button";

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatPrice(value?: number) {
  if (value == null) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function statusLabel(status: number) {
  if (status === 1) return "Hoạt động";
  if (status === 0) return "Hết hạn";
  return `Trạng thái ${status}`;
}

export default function AdminOwnerSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<OwnerSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await getAdminOwnerSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách gói đăng ký.",
      });
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Gói đăng ký của chủ xe
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Quản lý các gói dịch vụ mà chủ xe đã đăng ký.
        </p>
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

      <div className="flex justify-end">
        <Button onClick={fetchSubscriptions} variant="outline" size="sm">
          Làm mới
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CreditCard className="mb-3 h-12 w-12 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">
              Chưa có gói đăng ký nào
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Các gói đăng ký của chủ xe sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-semibold text-slate-700">ID</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Chủ xe
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Gói dịch vụ
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Ngày bắt đầu
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Ngày kết thúc
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Giá
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {sub.id}
                    </td>
                    <td className="px-4 py-3 text-slate-900">
                      {sub.ownerEmail ?? `Owner #${sub.ownerId}`}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {sub.packageName ?? `Gói #${sub.packageId}`}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(sub.startDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(sub.endDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatPrice(sub.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          sub.status === 1
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {statusLabel(sub.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
