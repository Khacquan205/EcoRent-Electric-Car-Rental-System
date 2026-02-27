/**
 * Generic API response wrapper
 */
export type ApiResult<T> = {
  success: boolean;
  message: string;
} & T;

/** Single post item from GET /api/posts (car listing) */
export interface PostListItemDto {
  id: number;
  title: string;
  price: number;
  status: number;
  statusName?: string;
  createdAt: string;
  expiredAt?: string | null;
  categoryName?: string | null;
}

/** Paginated result from GET /api/posts */
export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
