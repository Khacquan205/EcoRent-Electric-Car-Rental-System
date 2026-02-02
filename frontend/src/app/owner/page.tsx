"use client";

import { useState } from "react";
import * as ownerApi from "@/lib/ownerApi";

export default function OwnerPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string>("");

  async function onRegister() {
    setIsSubmitting(true);
    setResult("");
    try {
      const res = await ownerApi.registerOwner({ name, phone });
      setResult(JSON.stringify(res, null, 2));
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Register failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onVerify() {
    setIsSubmitting(true);
    setResult("");
    try {
      const res = await ownerApi.verifyIdentity();
      setResult(JSON.stringify(res, null, 2));
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Verify failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onMe() {
    setIsSubmitting(true);
    setResult("");
    try {
      const res = await ownerApi.me();
      setResult(JSON.stringify(res, null, 2));
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Me failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-128px)] bg-white">
      <div className="container mx-auto px-6 py-14">
        <div className="mx-auto grid max-w-3xl gap-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-gray-900">Owner</h1>
            <p className="mt-2 text-sm text-gray-600">
              Đăng ký chủ xe, xác thực danh tính và xem thông tin của bạn.
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

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void onRegister()}
                  className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-600 px-6 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Register owner
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void onMe()}
                  className="inline-flex h-11 items-center justify-center rounded-md border px-6 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-60"
                >
                  Get me
                </button>
              </div>

              <div className="mt-2 rounded-xl border p-4">
                <p className="text-sm font-medium text-gray-900">Verify identity</p>
                <p className="mt-1 text-xs text-gray-600">Nhập code (OTP) bạn nhận được.</p>
                <input
                  className="mt-3 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="505858"
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void onVerify()}
                  className="mt-3 inline-flex h-10 items-center justify-center rounded-md bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-900">Result</p>
            <pre className="mt-3 max-h-[420px] overflow-auto rounded-xl bg-gray-900 p-4 text-xs text-gray-100">
              {result || "(no result)"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
