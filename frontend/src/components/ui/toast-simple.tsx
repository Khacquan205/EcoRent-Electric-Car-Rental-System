"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export type ToastItem = {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info";
  postId?: number | null;
};

export function ToastList({
  toasts,
  remove,
}: {
  toasts: ToastItem[];
  remove: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} item={t} onClose={() => remove(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = item.type === "success";
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : item.type === "error"
            ? "border-red-200 bg-red-50 text-red-900"
            : "border-sky-200 bg-sky-50 text-sky-900"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0 text-red-600" />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium">{item.title}</p>
        <p className="mt-0.5 text-sm opacity-90">{item.message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded p-1 opacity-70 hover:opacity-100"
        aria-label="Đóng"
      >
        ×
      </button>
    </div>
  );
}
