import { apiFetch } from "./client";
import type { PagedResultDto, PostDetailDto, PostListItemDto } from "@/types/api";

export type PostDetail = PostDetailDto;

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
  registrationImageUrl?: string;
  inspectionImageUrl?: string;
  insuranceImageUrl?: string;
}

export interface CreatePostResponse {
  id: number;
  status: number;
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

export async function getPostDetail(postId: number): Promise<PostDetailDto> {
  return apiFetch<PostDetailDto>(`/api/Post/${postId}`, { method: "GET" });
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
