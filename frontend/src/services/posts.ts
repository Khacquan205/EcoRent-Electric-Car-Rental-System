import { apiFetch } from "./client";
import type { PagedResultDto, PostListItemDto } from "@/types/api";

export interface CreatePostRequest {
  categoryId: number;
  locationId?: number | null;
  title: string;
  description?: string | null;
  price: number;
  contactPhone?: string | null;
  imageUrls?: string[];
  imageUrl?: string;
  videoUrls?: string[];
}

export interface CreatePostResponse {
  id: number;
  status: number;
}

export interface PostDetail {
  id: number;
  categoryId: number;
  categoryName: string;
  locationId?: number | null;
  locationName?: string | null;
  title: string;
  description?: string | null;
  price: number;
  contactPhone?: string | null;
  status: number;
  statusName: string;
  rejectReason?: string | null;
  priorityLevel: number;
  createdAt: string;
  updatedAt?: string | null;
  expiredAt?: string | null;
  /** Optional images returned by backend for the post detail. */
  images?: string[] | null;
  /** Optional videos returned by backend for the post detail. */
  videos?: string[] | null;
  /** Optional owner display name if backend provides it. */
  ownerName?: string | null;
}

export async function createPost(
  body: CreatePostRequest,
): Promise<CreatePostResponse> {
  return apiFetch<CreatePostResponse>("/api/Post/create-post", {
    method: "POST",
    body,
  });
}

export async function getMyPosts(): Promise<PostListItemDto[]> {
  const result = await apiFetch<
    PostListItemDto[] | { items?: PostListItemDto[] }
  >("/api/Post/my-posts", { method: "GET" });
  if (Array.isArray(result)) return result;
  return (result as { items?: PostListItemDto[] }).items ?? [];
}

export async function getPostDetail(postId: number): Promise<PostDetail> {
  return apiFetch<PostDetail>(`/api/Post/${postId}`, { method: "GET" });
}

export async function getPublicPosts(
  params: {
    page?: number;
    pageSize?: number;
    categoryId?: number | null;
  } = {},
): Promise<PagedResultDto<PostListItemDto>> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 12));
  const search = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (params.categoryId != null) {
    search.set("categoryId", String(params.categoryId));
  }
  return apiFetch<PagedResultDto<PostListItemDto>>(`/api/posts?${search}`);
}
