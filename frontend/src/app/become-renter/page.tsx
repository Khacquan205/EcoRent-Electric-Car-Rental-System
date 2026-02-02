"use client";

import { useEffect, useState } from "react";
import * as ownerApi from "@/lib/ownerApi";

export default function BecomeRenterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [meJson, setMeJson] = useState<string>("");

  async function refreshMe() {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await ownerApi.me();
      if (!res.success) {
        setMessage(res.message || "Không lấy được thông tin owner");
        setMeJson("");
        return;
      }
      setMeJson(JSON.stringify(res, null, 2));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onRegisterOwner() {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await ownerApi.registerOwner({ name, phone });
      if (!res.success) {
        setMessage(res.message || "Đăng ký thất bại");
        return;
      }
      setMessage(res.message || "Đăng ký thành công. Vui lòng xác thực danh tính.");
      await refreshMe();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Đăng ký thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onVerifyIdentity() {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await ownerApi.verifyIdentity();
      if (!res.success) {
        setMessage(res.message || "Xác thực thất bại");
        return;
      }
      setMessage(res.message || "Xác thực thành công");
      await refreshMe();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Xác thực thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    void refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[calc(100vh-128px)] bg-white">
      <div className="container mx-auto px-6 py-14">
        <div className="mx-auto grid w-full max-w-4xl gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-gray-900">Become a renter</h1>
            <p className="mt-2 text-sm text-gray-600">
              Đăng ký để trở thành chủ xe (Owner) và xác thực danh tính.
            </p>

            <div className="mt-6 grid gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Tên</label>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="090..."
                />
              </div>

              {message && (
                <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  {message}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void onRegisterOwner()}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-600 px-6 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Register owner
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void onVerifyIdentity()}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-sky-600 px-6 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Verify identity
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void refreshMe()}
                  className="inline-flex h-11 items-center justify-center rounded-md border px-6 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-2 rounded-xl bg-sky-50 p-4">
                <p className="text-xs text-sky-900">
                  Lưu ý: API <span className="font-mono">/api/Owner/verify-identity</span> theo swagger đang không
                  cần request body.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Owner me</h2>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void refreshMe()}
                className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-60"
              >
                Reload
              </button>
            </div>
            <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl bg-gray-900 p-4 text-xs text-gray-100">
              {meJson || "(no data)"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
