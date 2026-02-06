/**
 * Generic API response wrapper
 */
export type ApiResult<T> = {
  success: boolean;
  message: string;
} & T;
