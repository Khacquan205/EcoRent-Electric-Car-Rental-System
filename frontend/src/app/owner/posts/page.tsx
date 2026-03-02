"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getMyPosts, getPostDetail } from "@/services/posts";
import type { PostListItemDto } from "@/types/api";
import type { PostDetail } from "@/services/posts";
import { useSignalRNotifications } from "@/hooks/useSignalRNotifications";
import { ToastList, type ToastItem } from "@/components/ui/toast-simple";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Car, PlusCircle, Eye, Calendar, Tag } from "lucide-react";

const STATUS_MAP: Record<number, string> = {
  0: "Chờ duyệt",
  1: "Đã duyệt",
  2: "Từ chối",
};

const STATUS_STYLES: Record<number, string> = {
  0: "bg-amber-100 text-amber-700 border border-amber-200",
  1: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  2: "bg-red-100 text-red-700 border border-red-200",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function OwnerPostsPage() {
  const [posts, setPosts] = useState<PostListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [detailPostId, setDetailPostId] = useState<number | null>(null);
  const [detailPost, setDetailPost] = useState<PostDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPosts = useCallback(() => {
    getMyPosts()
      .then(setPosts)
      .catch((e) => setError(e instanceof Error ? e.message : "Lỗi tải tin"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPosts();
  }, [fetchPosts]);

  const addToast = useCallback((item: Omit<ToastItem, "id">) => {
    setToasts((prev) => [
      ...prev,
      { ...item, id: `toast-${Date.now()}-${Math.random().toString(36).slice(2)}` },
    ]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useSignalRNotifications(
    useCallback(
      (payload) => {
        addToast({
          title: payload.title,
          message: payload.message,
          type: payload.title.toLowerCase().includes("reject") ? "error" : "success",
          postId: payload.postId,
        });
        if (payload.postId != null) {
          const approved = payload.title.toLowerCase().includes("approved");
          const rejected = payload.title.toLowerCase().includes("rejected");
          setPosts((prev) =>
            prev.map((p) =>
              p.id === payload.postId
                ? {
                    ...p,
                    status: approved ? 1 : rejected ? 2 : p.status,
                    statusName: approved ? "Approved" : rejected ? "Rejected" : p.statusName,
                  }
                : p
            )
          );
        }
      },
      [addToast]
    )
  );

  const openDetail = useCallback((postId: number) => {
    setDetailPostId(postId);
    setDetailPost(null);
    setDetailLoading(true);
    getPostDetail(postId)
      .then(setDetailPost)
      .catch(() => setDetailPost(null))
      .finally(() => setDetailLoading(false));
  }, []);

  const closeDetail = useCallback(() => {
    setDetailPostId(null);
    setDetailPost(null);
  }, []);

  const approvedCount = posts.filter((p) => p.status === 1).length;
  const pendingCount = posts.filter((p) => p.status === 0).length;
  const rejectedCount = posts.filter((p) => p.status === 2).length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-slate-500">Đang tải tin đăng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Tin đăng của tôi</h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý tin đăng cho thuê xe. Cập nhật trạng thái theo thời gian thực.
            </p>
          </div>
          <Link
            href="/owner/post/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
          >
            <PlusCircle className="h-4 w-4" />
            Đăng xe mới
          </Link>
        </div>

        {/* Stats Bar */}
        {posts.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Đã duyệt</p>
              <p className="mt-2 text-3xl font-bold text-emerald-500">{approvedCount}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Chờ duyệt</p>
              <p className="mt-2 text-3xl font-bold text-amber-500">{pendingCount}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Từ chối</p>
              <p className="mt-2 text-3xl font-bold text-red-500">{rejectedCount}</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty State */}
        {posts.length === 0 && !error && (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Car className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-5 text-base font-semibold text-slate-700">Chưa có tin đăng nào</h3>
            <p className="mt-2 text-sm text-slate-500">
              Bắt đầu bằng cách đăng chiếc xe điện đầu tiên của bạn.
            </p>
            <Link
              href="/owner/post/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
            >
              <PlusCircle className="h-4 w-4" />
              Đăng xe ngay
            </Link>
          </div>
        )}

        {/* Posts Grid */}
        {posts.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <div
                key={p.id}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                onClick={() => openDetail(p.id)}
                onKeyDown={(e) => e.key === "Enter" && openDetail(p.id)}
                role="button"
                tabIndex={0}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      STATUS_STYLES[p.status] ?? "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {STATUS_MAP[p.status] ?? p.statusName ?? p.status}
                  </span>
                </div>

                {/* Content */}
                <div className="mt-4">
                  <p className="line-clamp-2 font-semibold text-slate-900 transition-colors duration-200 group-hover:text-primary">
                    {p.title}
                  </p>
                  <p className="mt-1.5 text-lg font-bold text-primary">
                    {Number(p.price).toLocaleString("vi-VN")}
                    <span className="ml-1 text-xs font-normal text-slate-400">₫ / ngày</span>
                  </p>
                </div>

                {/* Meta */}
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
                  {p.categoryName && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Tag className="h-3 w-3" />
                      {p.categoryName}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {formatDate(p.createdAt)}
                  </span>
                </div>

                {/* View hint */}
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <Eye className="h-3.5 w-3.5" />
                  Xem chi tiết
                </div>
              </div>
            ))}
          </div>
        )}

        <ToastList toasts={toasts} remove={removeToast} />

        <Dialog open={detailPostId !== null} onOpenChange={(open) => !open && closeDetail()}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Chi tiết tin đăng</DialogTitle>
              <DialogDescription>Thông tin xe và trạng thái duyệt</DialogDescription>
            </DialogHeader>
            {detailLoading && (
              <p className="py-8 text-center text-sm text-slate-500">Đang tải...</p>
            )}
            {detailPost && !detailLoading && (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{detailPost.title}</p>
                  <p className="mt-1 text-slate-600">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      detailPost.price
                    )}{" "}
                    / ngày
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-500">Danh mục</span>
                  <span>{detailPost.categoryName}</span>
                  <span className="text-slate-500">Trạng thái</span>
                  <span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        detailPost.status === 1
                          ? "bg-emerald-100 text-emerald-800"
                          : detailPost.status === 2
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {detailPost.statusName}
                    </span>
                  </span>
                  <span className="text-slate-500">Ngày đăng</span>
                  <span>{formatDate(detailPost.createdAt)}</span>
                  {detailPost.locationName && (
                    <>
                      <span className="text-slate-500">Địa điểm</span>
                      <span>{detailPost.locationName}</span>
                    </>
                  )}
                </div>
                {detailPost.description && (
                  <div>
                    <p className="font-medium text-slate-700">Mô tả</p>
                    <p className="mt-1 rounded-lg bg-slate-50 p-3 text-slate-600">
                      {detailPost.description}
                    </p>
                  </div>
                )}
                {detailPost.status === 2 && detailPost.rejectReason && (
                  <div>
                    <p className="font-medium text-red-700">Lý do từ chối</p>
                    <p className="mt-1 rounded-lg bg-red-50 p-3 text-red-800">
                      {detailPost.rejectReason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
