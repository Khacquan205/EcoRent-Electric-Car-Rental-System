import { apiFetch } from "./client";
import type { PagedResultDto, PostListItemDto } from "@/types/api";

const PAGE_SIZE = 8;

export interface GetCarsParams {
  page?: number;
  pageSize?: number;
}

/**
 * Fetch paginated car posts from API.
 * Uses GET /api/posts (backend) with page and pageSize.
 */
export async function getCars(
  params: GetCarsParams = {}
): Promise<PagedResultDto<PostListItemDto>> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? PAGE_SIZE));
  const search = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  return apiFetch<PagedResultDto<PostListItemDto>>(`/api/posts?${search}`);
}

export const CARS_PAGE_SIZE = PAGE_SIZE;
