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
  description?: string | null;
  price: number;
  status: number;
  statusName?: string;
  createdAt: string;
  expiredAt?: string | null;
  categoryName?: string | null;
  locationName?: string | null;
  /** True if post currently has an active advertisement applied (backend-sorted). */
  isPromoted?: boolean;
  /** 0 = not promoted, 1..3 = promoted priority level (backend-sorted). */
  promotedPriorityLevel?: number;
  /** Explainability labels returned from suggest-cars ranking. */
  matchReasons?: string[] | null;
  images?: string[] | null;
  videos?: string[] | null;
}

/** Full post detail from GET /api/Post/:id */
export interface PostDetailDto {
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
  images?: string[] | null;
  videos?: string[] | null;
  ownerName?: string | null;
}

/** Paginated result from GET /api/posts */
export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
