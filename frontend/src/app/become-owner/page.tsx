"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Upload,
  FileCheck,
  CheckCircle2,
  Video,
  Camera,
} from "lucide-react";
import * as ownerApi from "@/services/owner";
import { ApiError } from "@/services/client";

const STEPS = [
  { id: 1, title: "Upload CCCD", desc: "Tải ảnh mặt trước và mặt sau" },
  { id: 2, title: "KYC Check", desc: "Nhận diện thông tin từ CCCD" },
  { id: 3, title: "Face ID", desc: "Xác thực khuôn mặt bằng video" },
  { id: 4, title: "Xem lại & Xác nhận", desc: "Kiểm tra và gửi KYC" },
] as const;

export default function BecomeOwnerPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [ocrData, setOcrData] = useState<ownerApi.KycOcrResponse | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Liveness state
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedPreview, setRecordedPreview] = useState<string | null>(null);
  const [livenessError, setLivenessError] = useState<string | null>(null);
  const [livenessResult, setLivenessResult] =
    useState<ownerApi.KycLivenessResponse | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    ownerApi
      .me()
      .then(() => router.replace("/owner"))
      .catch(() => {
        // Expected: user is not yet an owner (403). Stay on this page.
      });
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
      if (recordedPreview) URL.revokeObjectURL(recordedPreview);
      stopCamera();
    };
  }, [frontPreview, backPreview, recordedPreview]);

  const goToKycCheck = () => {
    if (frontFile && backFile) {
      setOcrError(null);
      setOcrData(null);
      setStep(2);
    }
  };

  /* ---------- Camera / Liveness helpers ---------- */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setLivenessError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch {
      setLivenessError(
        "Không thể truy cập camera. Vui lòng cho phép quyền camera.",
      );
    }
  }, []);

  /** Pick the best mime type: prefer mp4 (backend requirement), fallback to webm */
  const pickMimeType = useCallback((): string => {
    if (MediaRecorder.isTypeSupported("video/mp4")) return "video/mp4";
    if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1"))
      return "video/mp4;codecs=avc1";
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9"))
      return "video/webm;codecs=vp9";
    return "video/webm";
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setRecordedBlob(null);
    if (recordedPreview) {
      URL.revokeObjectURL(recordedPreview);
      setRecordedPreview(null);
    }
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      // Always produce an mp4-typed blob so the backend accepts it
      const blob = new Blob(chunksRef.current, { type: "video/mp4" });
      setRecordedBlob(blob);
      setRecordedPreview(URL.createObjectURL(blob));
      stopCamera();
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
    // Auto-stop after 5 seconds
    setTimeout(() => {
      if (recorder.state === "recording") {
        recorder.stop();
        setIsRecording(false);
      }
    }, 5000);
  }, [recordedPreview, stopCamera, pickMimeType]);

  /** Handle file upload fallback (user picks an MP4 file) */
  const handleVideoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setRecordedBlob(file);
      setRecordedPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      setLivenessError(null);
      stopCamera();
      e.target.value = "";
    },
    [stopCamera],
  );

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const runLivenessCheck = async () => {
    if (!recordedBlob || !ocrData?.cccdFaceId) return;
    setLoading(true);
    setLivenessError(null);
    try {
      const result = await ownerApi.kycLiveness(
        recordedBlob,
        ocrData.cccdFaceId,
      );
      if (result.errorMessage) {
        setLivenessError(result.errorMessage);
        return;
      }
      if (!result.isLive || !result.isMatch) {
        setLivenessError(
          `Xác thực khuôn mặt thất bại. ${!result.isLive ? "Không phát hiện người thật." : ""} ${!result.isMatch ? "Khuôn mặt không khớp với CCCD." : ""} Vui lòng thử lại.`,
        );
        return;
      }
      setLivenessResult(result);
      setStep(4);
    } catch (e) {
      setLivenessError(
        e instanceof Error
          ? e.message
          : "Xác thực khuôn mặt thất bại. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  const retryLiveness = async () => {
    setRecordedBlob(null);
    if (recordedPreview) {
      URL.revokeObjectURL(recordedPreview);
      setRecordedPreview(null);
    }
    setLivenessError(null);
    setLivenessResult(null);
    await startCamera();
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
      // Auto-start camera for liveness step
      void startCamera();
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
        gender: ocrData.gender || undefined,
        frontDocumentUrl: ocrData.frontImageUrl || undefined,
        backDocumentUrl: ocrData.backImageUrl || undefined,
      });
      setSubmitSuccess(true);
    } catch (e) {
      if (e instanceof ApiError) {
        setOcrError(e.detail);
      } else {
        setOcrError(e instanceof Error ? e.message : "Gửi KYC thất bại.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center max-w-md">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">
            KYC đã gửi thành công
          </h1>
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
          <h1 className="text-2xl font-bold text-slate-900">
            Trở thành chủ xe
          </h1>
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
                  step >= s.id
                    ? "bg-[#1572D3] text-white"
                    : "bg-slate-200 text-slate-500"
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
              <h2 className="text-lg font-semibold text-slate-900">
                Bước 1: Upload CCCD
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Tải lên ảnh mặt trước và mặt sau CCCD/CMND.
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Mặt trước CCCD
                  </label>
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
                        <p className="mt-2 text-xs text-slate-500">
                          Nhấn để chọn lại ảnh
                        </p>
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
                  <label className="block text-sm font-medium text-slate-700">
                    Mặt sau CCCD
                  </label>
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
                        <p className="mt-2 text-xs text-slate-500">
                          Nhấn để chọn lại ảnh
                        </p>
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
              <h2 className="text-lg font-semibold text-slate-900">
                Bước 2: KYC Check
              </h2>
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

          {/* STEP 3 – Liveness / Face ID */}
          {step === 3 && ocrData && (
            <>
              <h2 className="text-lg font-semibold text-slate-900">
                Bước 3: Xác thực khuôn mặt
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Quay video khuôn mặt để xác minh bạn là người thật và khớp với
                ảnh CCCD.
              </p>

              {livenessError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {livenessError}
                </div>
              )}

              <div className="mt-6 flex flex-col items-center gap-4">
                {/* Live camera preview */}
                {!recordedPreview && (
                  <div className="relative w-full max-w-sm overflow-hidden rounded-xl border-2 border-slate-200 bg-black aspect-[4/3]">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="h-full w-full object-cover mirror"
                      style={{ transform: "scaleX(-1)" }}
                    />
                    {isRecording && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                        <span className="text-xs font-medium text-white drop-shadow">
                          Đang quay...
                        </span>
                      </div>
                    )}
                    {!cameraReady && !livenessError && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm text-slate-400">
                          Đang khởi tạo camera...
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Recorded video preview */}
                {recordedPreview && (
                  <div className="relative w-full max-w-sm overflow-hidden rounded-xl border-2 border-emerald-200 bg-black aspect-[4/3]">
                    <video
                      src={recordedPreview}
                      controls
                      className="h-full w-full object-cover"
                      style={{ transform: "scaleX(-1)" }}
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2 py-0.5">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                      <span className="text-xs font-medium text-white">
                        Đã quay xong
                      </span>
                    </div>
                  </div>
                )}

                {/* Recording controls */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {!recordedPreview && !isRecording && cameraReady && (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="inline-flex items-center rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Bắt đầu quay (5 giây)
                    </button>
                  )}
                  {isRecording && (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="inline-flex items-center rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Dừng quay
                    </button>
                  )}
                  {recordedPreview && !loading && (
                    <button
                      type="button"
                      onClick={() => void retryLiveness()}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Quay lại video
                    </button>
                  )}
                </div>

                {/* Upload fallback */}
                {!recordedPreview && !isRecording && (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-400">hoặc</span>
                    <label
                      htmlFor="video-upload"
                      className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Tải lên video MP4
                    </label>
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/mp4,.mp4"
                      className="sr-only"
                      onChange={handleVideoUpload}
                    />
                  </div>
                )}

                <p className="text-xs text-slate-500 text-center max-w-sm">
                  Hãy nhìn thẳng vào camera, giữ khuôn mặt rõ ràng và đủ ánh
                  sáng. Video sẽ tự động dừng sau 5 giây.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setStep(2);
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Quay lại
                </button>
                {recordedPreview && (
                  <button
                    type="button"
                    onClick={() => void runLivenessCheck()}
                    disabled={loading}
                    className="inline-flex items-center rounded-lg bg-[#1572D3] px-4 py-2 text-sm font-medium text-white hover:bg-[#1260B0] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span className="ml-2">Đang xác thực...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="mr-2 h-4 w-4" />
                        Xác thực khuôn mặt
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}

          {/* STEP 4 – Review (read-only) + Submit */}
          {step === 4 && ocrData && (
            <>
              <h2 className="text-lg font-semibold text-slate-900">
                Bước 4: Xem lại thông tin
              </h2>
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
                  <dt className="text-xs font-medium uppercase text-slate-500">
                    Họ và tên
                  </dt>
                  <dd className="mt-1 text-slate-900">
                    {ocrData.fullName || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">
                    Ngày sinh
                  </dt>
                  <dd className="mt-1 text-slate-900">{ocrData.dob || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">
                    Giới tính
                  </dt>
                  <dd className="mt-1 text-slate-900">
                    {ocrData.gender === "Male"
                      ? "Nam"
                      : ocrData.gender === "Female"
                        ? "Nữ"
                        : ocrData.gender || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">
                    Số CCCD
                  </dt>
                  <dd className="mt-1 text-slate-900">
                    {ocrData.cccdNumber || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">
                    Địa chỉ
                  </dt>
                  <dd className="mt-1 text-slate-900">
                    {ocrData.address || "—"}
                  </dd>
                </div>
              </dl>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
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
