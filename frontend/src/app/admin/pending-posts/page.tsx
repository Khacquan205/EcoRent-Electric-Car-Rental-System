"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getModerationPosts,
  approvePost,
  rejectPost,
  type ModerationPostItem,
  type ModerationPostsParams,
} from "@/services/moderation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Filter,
  Car,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  ImageIcon,
} from "lucide-react";

const STATUS_PENDING = 0;
const STATUS_APPROVED = 1;
const STATUS_REJECTED = 2;

const STATUS_LABELS: Record<number, string> = {
  [STATUS_PENDING]: "Chờ duyệt",
  [STATUS_APPROVED]: "Đã duyệt",
  [STATUS_REJECTED]: "Đã từ chối",
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("vi-VN", {
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

/* ─── Mini Gallery for Admin Detail Dialog ──────────────────────── */

type AdminMediaItem =
  | { kind: "image"; src: string }
  | { kind: "video"; src: string };

function AdminDetailGallery({
  images,
  videos,
  title,
}: {
  images: string[];
  videos: string[];
  title: string;
}) {
  const items: AdminMediaItem[] = [
    ...images.map((src) => ({ kind: "image" as const, src })),
    ...videos.map((src) => ({ kind: "video" as const, src })),
  ];

  const [active, setActive] = useState(0);
  const total = items.length;
  const current = items[active];

  if (total === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl bg-slate-100">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs">Không có ảnh / video</span>
        </div>
      </div>
    );
  }

  const go = (dir: 1 | -1) => setActive((i) => (i + dir + total) % total);

  return (
    <div className="overflow-hidden rounded-xl bg-gray-950">
      {/* Main viewer */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {current.kind === "image" ? (
          <img
            key={current.src}
            src={current.src}
            alt={`${title} – ${active + 1}`}
            className="h-full w-full object-contain"
          />
        ) : (
          <video
            key={current.src}
            src={current.src}
            controls
            playsInline
            className="h-full w-full object-contain"
          />
        )}

        {/* Nav arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow transition-all hover:bg-white hover:scale-105"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow transition-all hover:bg-white hover:scale-105"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Counter */}
            <div className="absolute bottom-2 right-2 z-10 rounded-md bg-black/70 px-2.5 py-1 text-xs font-bold text-white">
              {current.kind === "video" && (
                <PlayCircle className="mr-1 inline h-3 w-3" />
              )}
              {active + 1} / {total}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="flex gap-1.5 overflow-x-auto bg-gray-100 px-2 py-2 scrollbar-hide dark:bg-gray-900">
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActive(idx)}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                idx === active
                  ? "border-[#1572D3] shadow-md shadow-blue-500/30 scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {item.kind === "image" ? (
                <img
                  src={item.src}
                  alt={`Ảnh thu nhỏ ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="relative h-full w-full bg-gray-900">
                  <video
                    src={item.src}
                    className="h-full w-full object-cover opacity-70"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <PlayCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PendingCarPostsPage() {
  const [posts, setPosts] = useState<ModerationPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [actionPostId, setActionPostId] = useState<number | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterOwnerName, setFilterOwnerName] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  // Reject modal
  const [rejectModalPost, setRejectModalPost] =
    useState<ModerationPostItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  // View details modal
  const [detailPost, setDetailPost] = useState<ModerationPostItem | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params: ModerationPostsParams = {};
      if (filterStatus !== "") params.status = Number(filterStatus);
      if (filterFromDate) params.fromDate = filterFromDate;
      if (filterToDate) params.toDate = filterToDate;
      const data = await getModerationPosts(params);
      setPosts(data);
    } catch (e) {
      setMessage({
        type: "error",
        text:
          e instanceof Error ? e.message : "Không thể tải danh sách bài đăng",
      });
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterFromDate, filterToDate]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Client-side filter by owner name (backend doesn't have ownerName search; we filter in UI)
  const filteredPosts = filterOwnerName.trim()
    ? posts.filter((p) =>
        p.ownerName
          ?.toLowerCase()
          .includes(filterOwnerName.trim().toLowerCase()),
      )
    : posts;

  const handleApprove = async (post: ModerationPostItem) => {
    if (post.status !== STATUS_PENDING) return;
    setActionPostId(post.id);
    setMessage(null);
    try {
      await approvePost(post.id);
      setMessage({
        type: "success",
        text: "Đã duyệt bài đăng. Chủ xe đã được thông báo.",
      });
      await fetchPosts();
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Duyệt bài thất bại",
      });
    } finally {
      setActionPostId(null);
    }
  };

  const openRejectModal = (post: ModerationPostItem) => {
    if (post.status !== STATUS_PENDING) return;
    setRejectModalPost(post);
    setRejectReason("");
  };

  const handleRejectSubmit = async () => {
    if (!rejectModalPost || !rejectReason.trim()) return;
    setRejectSubmitting(true);
    setMessage(null);
    try {
      await rejectPost(rejectModalPost.id, rejectReason.trim());
      setMessage({
        type: "success",
        text: "Đã từ chối bài đăng. Chủ xe đã được thông báo.",
      });
      setRejectModalPost(null);
      setRejectReason("");
      await fetchPosts();
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Từ chối bài thất bại",
      });
    } finally {
      setRejectSubmitting(false);
    }
  };

  const closeRejectModal = () => {
    if (!rejectSubmitting) {
      setRejectModalPost(null);
      setRejectReason("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Bài đăng xe chờ duyệt
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Duyệt hoặc từ chối bài đăng xe. Chỉ bài đã duyệt mới hiển thị cho
          khách hàng.
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

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter className="h-4 w-4" />
          Bộ lọc
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Tất cả</option>
              <option value={STATUS_PENDING}>Chờ duyệt</option>
              <option value={STATUS_APPROVED}>Đã duyệt</option>
              <option value={STATUS_REJECTED}>Đã từ chối</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Tên chủ xe
            </label>
            <Input
              placeholder="Tìm chủ xe..."
              value={filterOwnerName}
              onChange={(e) => setFilterOwnerName(e.target.value)}
              className="h-9 w-40 border-slate-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Từ ngày
            </label>
            <Input
              type="date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
              className="h-9 w-40 border-slate-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Đến ngày
            </label>
            <Input
              type="date"
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
              className="h-9 w-40 border-slate-200"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchPosts()}
            className="h-9"
          >
            Áp dụng
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Không có bài đăng phù hợp bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Mã bài đăng
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Xe / Danh mục
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Chủ xe
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-700 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className={`border-b border-slate-100 ${
                      post.status === STATUS_PENDING ? "bg-amber-50/50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {post.id}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">
                        {post.title}
                      </span>
                      {post.categoryName && (
                        <span className="ml-1 text-slate-500">
                          ({post.categoryName})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {post.ownerName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          post.status === STATUS_PENDING
                            ? "bg-amber-100 text-amber-800"
                            : post.status === STATUS_APPROVED
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {STATUS_LABELS[post.status] ?? post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-slate-600"
                          onClick={() => setDetailPost(post)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {post.status === STATUS_PENDING && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApprove(post)}
                              disabled={actionPostId === post.id}
                            >
                              {actionPostId === post.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              <span className="ml-1">Duyệt</span>
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-8"
                              onClick={() => openRejectModal(post)}
                            >
                              <XCircle className="h-4 w-4" />
                              <span className="ml-1">Từ chối</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filteredPosts.length > 0 && (
        <p className="text-xs text-slate-500">
          Hiển thị {filteredPosts.length} bài đăng. Các dòng chờ duyệt được làm
          nổi bật.
        </p>
      )}

      {/* Reject modal */}
      <Dialog
        open={!!rejectModalPost}
        onOpenChange={(open) => !open && closeRejectModal()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Từ chối bài đăng</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối. Chủ xe sẽ được thông báo và bài đăng
              sẽ tiếp tục bị ẩn. Lượt đăng tin sẽ không bị trừ.
            </DialogDescription>
          </DialogHeader>
          {rejectModalPost && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Bài đăng: <strong>{rejectModalPost.title}</strong> (ID{" "}
                {rejectModalPost.id})
              </p>
              <label className="block text-xs font-medium text-slate-700">
                Lý do (bắt buộc)
              </label>
              <Textarea
                className="min-h-[80px] rounded-lg border-slate-200"
                rows={3}
                placeholder="Ví dụ: Ảnh mờ, thiếu giấy tờ bắt buộc..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter showCloseButton={false}>
            <Button
              variant="outline"
              onClick={closeRejectModal}
              disabled={rejectSubmitting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim() || rejectSubmitting}
            >
              {rejectSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Từ chối bài đăng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View details modal */}
      <Dialog
        open={!!detailPost}
        onOpenChange={(open) => !open && setDetailPost(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết bài đăng</DialogTitle>
            <DialogDescription>
              Thông tin xe và chi tiết gửi duyệt
            </DialogDescription>
          </DialogHeader>
          {detailPost && (
            <div className="space-y-4 text-sm">
              {/* Gallery */}
              <AdminDetailGallery
                images={detailPost.images ?? []}
                videos={detailPost.videos ?? []}
                title={detailPost.title}
              />

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <Car className="h-4 w-4" />
                  <span>Tiêu đề</span>
                </div>
                <div className="font-medium text-slate-900">
                  {detailPost.title}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="h-4 w-4" />
                  <span>Chủ xe</span>
                </div>
                <div>{detailPost.ownerName ?? "—"}</div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>Ngày gửi</span>
                </div>
                <div>{formatDate(detailPost.createdAt)}</div>
                <div className="text-slate-600">Danh mục</div>
                <div>{detailPost.categoryName ?? "—"}</div>
                <div className="text-slate-600">Giá</div>
                <div>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(detailPost.price)}
                </div>
                <div className="text-slate-600">Trạng thái</div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      detailPost.status === STATUS_PENDING
                        ? "bg-amber-100 text-amber-800"
                        : detailPost.status === STATUS_APPROVED
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {STATUS_LABELS[detailPost.status]}
                  </span>
                </div>
              </div>
              {detailPost.description && (
                <div>
                  <div className="mb-1 font-medium text-slate-700">Mô tả</div>
                  <p className="rounded-lg bg-slate-50 p-3 text-slate-600">
                    {detailPost.description}
                  </p>
                </div>
              )}
              {detailPost.status === STATUS_REJECTED &&
                detailPost.rejectReason && (
                  <div>
                    <div className="mb-1 font-medium text-slate-700">
                      Lý do từ chối
                    </div>
                    <p className="rounded-lg bg-red-50 p-3 text-red-800">
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
