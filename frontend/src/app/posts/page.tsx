"use client";

import { useState, useEffect, useCallback } from "react";
import { getPublicPosts } from "@/services/posts";
import type { PostListItemDto } from "@/types/api";
import { PostList } from "@/components/posts";

const PAGE_SIZE = 12;

export default function PostsPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{
    items: PostListItemDto[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPublicPosts({ page: pageNum, pageSize: PAGE_SIZE });
      setData({
        items: result.items,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách xe");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.currentPage ?? 1;
  const totalCount = data?.totalCount ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 lg:text-4xl">
            🚗 Xe cho thuê
          </h1>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
            Khám phá xe điện phù hợp cho chuyến đi của bạn
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* PostList handles loading / empty / grid */}
        {!error && (
          <PostList
            items={items}
            loading={loading}
            totalCount={totalCount}
            totalPages={totalPages}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
