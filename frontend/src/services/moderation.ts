import { apiFetch } from "./client";

/** Status: 0 = Pending, 1 = Approved, 2 = Rejected */
export interface ModerationPostItem {
  id: number;
  title: string;
  categoryName: string | null;
  ownerId: number;
  ownerName: string | null;
  createdAt: string;
  status: number;
  rejectReason: string | null;
  price: number;
  description: string | null;
  images?: string[] | null;
  videos?: string[] | null;
}

export interface ModerationPostsParams {
  status?: number; // 0 Pending, 1 Approved, 2 Rejected
  ownerId?: number;
  fromDate?: string; // ISO date
  toDate?: string;
}

export interface ApproveRejectResponse {
  postId: number;
  status: number;
  message: string;
}

export async function getModerationPosts(
  params?: ModerationPostsParams
): Promise<ModerationPostItem[]> {
  const search = new URLSearchParams();
  if (params?.status !== undefined) search.set("status", String(params.status));
  if (params?.ownerId !== undefined) search.set("ownerId", String(params.ownerId));
  if (params?.fromDate) search.set("fromDate", params.fromDate);
  if (params?.toDate) search.set("toDate", params.toDate);
  const qs = search.toString();
  const url = `/api/moderation/posts${qs ? `?${qs}` : ""}`;
  return apiFetch<ModerationPostItem[]>(url, { method: "GET" });
}

export async function approvePost(postId: number): Promise<ApproveRejectResponse> {
  return apiFetch<ApproveRejectResponse>(`/api/moderation/posts/${postId}/approve`, {
    method: "POST",
  });
}

export async function rejectPost(
  postId: number,
  reason: string
): Promise<ApproveRejectResponse> {
  return apiFetch<ApproveRejectResponse>(`/api/moderation/posts/${postId}/reject`, {
    method: "POST",
    body: { reason },
  });
}
