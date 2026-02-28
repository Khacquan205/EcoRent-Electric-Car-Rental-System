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
} from "lucide-react";

const STATUS_PENDING = 0;
const STATUS_APPROVED = 1;
const STATUS_REJECTED = 2;

const STATUS_LABELS: Record<number, string> = {
  [STATUS_PENDING]: "Pending",
  [STATUS_APPROVED]: "Approved",
  [STATUS_REJECTED]: "Rejected",
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

export default function PendingCarPostsPage() {
  const [posts, setPosts] = useState<ModerationPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [actionPostId, setActionPostId] = useState<number | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterOwnerName, setFilterOwnerName] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  // Reject modal
  const [rejectModalPost, setRejectModalPost] = useState<ModerationPostItem | null>(null);
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
        text: e instanceof Error ? e.message : "Failed to load posts",
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
    ? posts.filter(
        (p) =>
          p.ownerName?.toLowerCase().includes(filterOwnerName.trim().toLowerCase())
      )
    : posts;

  const handleApprove = async (post: ModerationPostItem) => {
    if (post.status !== STATUS_PENDING) return;
    setActionPostId(post.id);
    setMessage(null);
    try {
      await approvePost(post.id);
      setMessage({ type: "success", text: "Post approved. Owner notified." });
      await fetchPosts();
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Approve failed",
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
      setMessage({ type: "success", text: "Post rejected. Owner notified." });
      setRejectModalPost(null);
      setRejectReason("");
      await fetchPosts();
    } catch (e) {
      setMessage({
        type: "error",
        text: e instanceof Error ? e.message : "Reject failed",
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
        <h1 className="text-2xl font-semibold text-slate-900">Pending Car Posts</h1>
        <p className="mt-1 text-sm text-slate-600">
          Approve or reject car listings. Only approved posts are visible to customers.
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
          Filters
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value={STATUS_PENDING}>Pending</option>
              <option value={STATUS_APPROVED}>Approved</option>
              <option value={STATUS_REJECTED}>Rejected</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Owner name</label>
            <Input
              placeholder="Search owner..."
              value={filterOwnerName}
              onChange={(e) => setFilterOwnerName(e.target.value)}
              className="h-9 w-40 border-slate-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">From date</label>
            <Input
              type="date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
              className="h-9 w-40 border-slate-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">To date</label>
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
            Apply
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
            No posts match the filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-semibold text-slate-700">Post ID</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Car / Category</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Owner</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 text-right">Actions</th>
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
                    <td className="px-4 py-3 font-mono text-slate-600">{post.id}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{post.title}</span>
                      {post.categoryName && (
                        <span className="ml-1 text-slate-500">({post.categoryName})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{post.ownerName ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(post.createdAt)}</td>
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
                          title="View details"
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
                              <span className="ml-1">Approve</span>
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-8"
                              onClick={() => openRejectModal(post)}
                            >
                              <XCircle className="h-4 w-4" />
                              <span className="ml-1">Reject</span>
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
          Showing {filteredPosts.length} post(s). Pending rows are highlighted.
        </p>
      )}

      {/* Reject modal */}
      <Dialog open={!!rejectModalPost} onOpenChange={(open) => !open && closeRejectModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject post</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection. The owner will be notified and the post will remain
              hidden. Post slot will not be deducted.
            </DialogDescription>
          </DialogHeader>
          {rejectModalPost && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Post: <strong>{rejectModalPost.title}</strong> (ID {rejectModalPost.id})
              </p>
              <label className="block text-xs font-medium text-slate-700">Reason (required)</label>
              <Textarea
                className="min-h-[80px] rounded-lg border-slate-200"
                rows={3}
                placeholder="E.g. Image quality too low, missing required documents..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter showCloseButton={false}>
            <Button variant="outline" onClick={closeRejectModal} disabled={rejectSubmitting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim() || rejectSubmitting}
            >
              {rejectSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Reject post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View details modal */}
      <Dialog open={!!detailPost} onOpenChange={(open) => !open && setDetailPost(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Post details</DialogTitle>
            <DialogDescription>Car info and submission details</DialogDescription>
          </DialogHeader>
          {detailPost && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <Car className="h-4 w-4" />
                  <span>Title</span>
                </div>
                <div className="font-medium text-slate-900">{detailPost.title}</div>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="h-4 w-4" />
                  <span>Owner</span>
                </div>
                <div>{detailPost.ownerName ?? "—"}</div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>Submitted</span>
                </div>
                <div>{formatDate(detailPost.createdAt)}</div>
                <div className="text-slate-600">Category</div>
                <div>{detailPost.categoryName ?? "—"}</div>
                <div className="text-slate-600">Price</div>
                <div>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(detailPost.price)}
                </div>
                <div className="text-slate-600">Status</div>
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
                  <div className="mb-1 font-medium text-slate-700">Description</div>
                  <p className="rounded-lg bg-slate-50 p-3 text-slate-600">
                    {detailPost.description}
                  </p>
                </div>
              )}
              {detailPost.status === STATUS_REJECTED && detailPost.rejectReason && (
                <div>
                  <div className="mb-1 font-medium text-slate-700">Reject reason</div>
                  <p className="rounded-lg bg-red-50 p-3 text-red-800">{detailPost.rejectReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
