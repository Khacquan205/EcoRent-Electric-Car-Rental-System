"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Upload, FileCheck, CheckCircle2 } from "lucide-react";
import * as ownerApi from "@/services/owner";

const STEPS = [
  { id: 1, title: "Upload CCCD", desc: "Tải ảnh mặt trước và mặt sau" },
  { id: 2, title: "KYC Check", desc: "Nhận diện thông tin từ CCCD" },
  { id: 3, title: "Xem lại & Xác nhận", desc: "Kiểm tra và gửi KYC" },
] as const;

export default function BecomeOwnerPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [ocrData, setOcrData] = useState<ownerApi.KycOcrResponse | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    ownerApi.me().then(() => router.replace("/owner")).catch(() => {});
  }, [router]);

  const handleFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFrontFile(f);
      setFrontPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(f);
      });
    }
    e.target.value = "";
  };

  const handleBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setBackFile(f);
      setBackPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(f);
      });
    }
    e.target.value = "";
  };

  useEffect(() => {
    return () => {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      if (backPreview) URL.revokeObjectURL(backPreview);
    };
  }, [frontPreview, backPreview]);

  const goToKycCheck = () => {
    if (frontFile && backFile) {
      setOcrError(null);
      setOcrData(null);
      setStep(2);
    }
  };

  const runOcr = async () => {
    if (!frontFile || !backFile) return;
    setLoading(true);
    setOcrError(null);
    try {
      const data = await ownerApi.kycOcr(frontFile, backFile);
      if (data.errorMessage) {
        setOcrError(data.errorMessage);
        return;
      }
      setOcrData(data);
      setStep(3);
    } catch (e) {
      setOcrError(e instanceof Error ? e.message : "Không thể nhận dạng CCCD.");
    } finally {
      setLoading(false);
    }
  };

  const submitKyc = async () => {
    if (!ocrData) return;
    setLoading(true);
    try {
      await ownerApi.submitKycBecomeOwner({
        fullName: ocrData.fullName,
        dateOfBirth: ocrData.dob,
        idNumber: ocrData.cccdNumber,
        address: ocrData.address ?? undefined,
      });
      setSubmitSuccess(true);
    } catch (e) {
      setOcrError(e instanceof Error ? e.message : "Gửi KYC thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center max-w-md">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">KYC đã gửi thành công</h1>
          <p className="mt-2 text-sm text-slate-600">
            Bạn đã trở thành chủ xe. Bạn có thể đăng tin cho thuê xe.
          </p>
          <Link
            href="/owner"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#1572D3] px-4 py-2 text-sm font-medium text-white hover:bg-[#1260B0]"
          >
            Đến trang chủ xe
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-128px)] bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Trở thành chủ xe</h1>
          <p className="mt-1 text-sm text-slate-600">
            Xác thực CCCD để đăng ký làm chủ xe trên EcoRent.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                  step >= s.id ? "bg-[#1572D3] text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className="h-0.5 w-6 bg-slate-200" />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* STEP 1 – Upload CCCD */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-slate-900">Bước 1: Upload CCCD</h2>
              <p className="mt-1 text-sm text-slate-600">
                Tải lên ảnh mặt trước và mặt sau CCCD/CMND.
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Mặt trước CCCD</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFrontChange}
                    className="sr-only"
                    id="front-cccd"
                    aria-label="Chọn ảnh mặt trước CCCD"
                  />
                  <label
                    htmlFor="front-cccd"
                    className="mt-2 flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-300 hover:bg-slate-100"
                  >
                    {frontPreview ? (
                      <>
                        <div className="relative h-40 w-full overflow-hidden rounded-lg bg-slate-100">
                          <img
                            src={frontPreview}
                            alt="Preview mặt trước CCCD"
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">Nhấn để chọn lại ảnh</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-slate-400" />
                        <p className="mt-2 text-xs text-slate-500">Chọn ảnh</p>
                      </>
                    )}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Mặt sau CCCD</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackChange}
                    className="sr-only"
                    id="back-cccd"
                    aria-label="Chọn ảnh mặt sau CCCD"
                  />
                  <label
                    htmlFor="back-cccd"
                    className="mt-2 flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-300 hover:bg-slate-100"
                  >
                    {backPreview ? (
                      <>
                        <div className="relative h-40 w-full overflow-hidden rounded-lg bg-slate-100">
                          <img
                            src={backPreview}
                            alt="Preview mặt sau CCCD"
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">Nhấn để chọn lại ảnh</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-slate-400" />
                        <p className="mt-2 text-xs text-slate-500">Chọn ảnh</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={goToKycCheck}
                  disabled={!frontFile || !backFile}
                  className="rounded-lg bg-[#1572D3] px-4 py-2 text-sm font-medium text-white hover:bg-[#1260B0] disabled:opacity-50"
                >
                  Tiếp tục
                  <ChevronRight className="ml-1 inline h-4 w-4" />
                </button>
              </div>
            </>
          )}

          {/* STEP 2 – KYC Check */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-slate-900">Bước 2: KYC Check</h2>
              <p className="mt-1 text-sm text-slate-600">
                Hệ thống sẽ nhận diện thông tin từ ảnh CCCD của bạn.
              </p>
              {ocrError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {ocrError}
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => void runOcr()}
                  disabled={loading}
                  className="inline-flex items-center rounded-lg bg-[#1572D3] px-4 py-2 text-sm font-medium text-white hover:bg-[#1260B0] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span className="ml-2">Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="mr-2 h-4 w-4" />
                      Nhận diện CCCD
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* STEP 3 – Review (read-only) + Submit */}
          {step === 3 && ocrData && (
            <>
              <h2 className="text-lg font-semibold text-slate-900">Bước 3: Xem lại thông tin</h2>
              <p className="mt-1 text-sm text-slate-600">
                Kiểm tra thông tin đã đọc từ CCCD. Không thể chỉnh sửa.
              </p>
              {ocrError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {ocrError}
                </div>
              )}
              <dl className="mt-6 space-y-4 border-t border-slate-100 pt-4">
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">Họ và tên</dt>
                  <dd className="mt-1 text-slate-900">{ocrData.fullName || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">Ngày sinh</dt>
                  <dd className="mt-1 text-slate-900">{ocrData.dob || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">Số CCCD</dt>
                  <dd className="mt-1 text-slate-900">{ocrData.cccdNumber || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">Địa chỉ</dt>
                  <dd className="mt-1 text-slate-900">{ocrData.address || "—"}</dd>
                </div>
              </dl>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => void submitKyc()}
                  disabled={loading}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? "Đang gửi..." : "SUBMIT KYC"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
