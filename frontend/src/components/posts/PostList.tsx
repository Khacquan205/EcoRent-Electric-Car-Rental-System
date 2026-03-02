"use client";

import { Car } from "lucide-react";
import type { PostListItemDto } from "@/types/api";
import PostCard from "./PostCard";
import PostCardSkeleton from "./PostCardSkeleton";
import Pagination from "./Pagination";

interface PostListProps {
  items: PostListItemDto[];
  loading: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function PostList({
  items,
  loading,
  totalCount,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
}: PostListProps) {
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  if (loading) {
    return (
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: pageSize > 8 ? 8 : pageSize }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Car className="h-10 w-10 text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-gray-700 dark:text-gray-300">
          Chưa có bài đăng nào
        </h3>
        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
          Hãy quay lại sau hoặc thử tìm kiếm với từ khoá khác.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Count summary */}
      <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
        Hiển thị{" "}
        <span className="font-medium text-gray-600 dark:text-gray-300">
          {startItem}–{endItem}
        </span>{" "}
        trong{" "}
        <span className="font-medium text-gray-600 dark:text-gray-300">
          {totalCount}
        </span>{" "}
        bài đăng
      </p>

      {/* Grid — PostCard handles its own stagger via the `index` prop */}
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
