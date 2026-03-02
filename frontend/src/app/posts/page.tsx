"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Car } from "lucide-react";
import { CarPostCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { getPublicPosts } from "@/services/posts";
import type { PostListItemDto } from "@/types/api";

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
      const result = await getPublicPosts({
        page: pageNum,
        pageSize: PAGE_SIZE,
      });
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

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalCount);

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
            Xe cho thuê
          </h1>
          <p className="mt-2 text-slate-600">
            Tìm xe điện phù hợp cho chuyến đi của bạn
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
            <Link href="/" className="ml-2 font-medium underline">
              Về trang chủ
            </Link>
          </div>
        )}

        {loading ? (
          <div className="mt-10 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {!error && (
              <p className="mt-6 text-sm text-slate-500">
                Hiển thị {startItem}–{endItem} trong tổng {totalCount} bài đăng
              </p>
            )}

            {items.length > 0 ? (
              <>
                <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((post) => {
                    const anyPost = post as any;
                    const imageUrl =
                      anyPost.thumbnailUrl ??
                      anyPost.imageUrl ??
                      (Array.isArray(anyPost.images) &&
                      anyPost.images.length > 0
                        ? anyPost.images[0]
                        : null);
                    const locationText =
                      anyPost.locationName ?? anyPost.location ?? null;

                    return (
                      <CarPostCard
                        key={post.id}
                        post={post}
                        imageUrl={imageUrl}
                        location={locationText}
                      />
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!canPrev}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </Button>

                    <div className="flex items-center gap-1">
                      {(() => {
                        const windowSize = 5;
                        const start = Math.max(
                          1,
                          Math.min(
                            currentPage - Math.floor(windowSize / 2),
                            totalPages - windowSize + 1,
                          ),
                        );
                        const end = Math.min(
                          start + windowSize - 1,
                          totalPages,
                        );
                        const pages: number[] = [];
                        for (let i = start; i <= end; i++) pages.push(i);
                        return pages.map((p) => (
                          <Button
                            key={p}
                            variant={p === currentPage ? "default" : "ghost"}
                            size="sm"
                            className="h-9 w-9 rounded-full p-0"
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </Button>
                        ));
                      })()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!canNext}
                      className="gap-1"
                    >
                      Sau
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              !error && (
                <div className="mt-12 flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-sm">
                  <Car className="h-14 w-14 text-slate-300" />
                  <h3 className="mt-4 text-xl font-semibold text-slate-700">
                    Chưa có bài đăng
                  </h3>
                  <p className="mt-2 text-slate-500">Quay lại sau nhé!</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setPage(1)}
                  >
                    Về trang 1
                  </Button>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
