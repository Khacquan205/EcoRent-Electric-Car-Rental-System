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

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Tin của tôi</h1>
        <Link
          href="/owner/post/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusCircle className="h-4 w-4" />
          Đăng xe
        </Link>
      </div>
      <p className="mt-1 text-sm text-slate-600">Quản lý tin đăng. Cập nhật trạng thái theo thời gian thực.</p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {posts.length === 0 && !error && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <Car className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 font-medium text-slate-700">Chưa có tin nào</p>
          <Link
            href="/owner/post/new"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" />
            Đăng xe ngay
          </Link>
        </div>
      )}

      <ul className="mt-8 space-y-4">
        {posts.map((p) => (
          <li key={p.id}>
            <div
              className="group block cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:border-primary/40 hover:shadow-md"
              onClick={() => openDetail(p.id)}
              onKeyDown={(e) => e.key === "Enter" && openDetail(p.id)}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 group-hover:text-primary">
                    {p.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {Number(p.price).toLocaleString("vi-VN")} ₫ / ngày
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
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
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    p.status === 1
                      ? "bg-emerald-100 text-emerald-800"
                      : p.status === 2
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {STATUS_MAP[p.status] ?? p.statusName ?? p.status}
                </span>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  <Eye className="h-3.5 w-3.5" />
                  Xem chi tiết
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

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
  );
}
