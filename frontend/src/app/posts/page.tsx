"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getPublicPosts } from "@/services/posts";
import { getCategories } from "@/services/categories";
import type { PostListItemDto } from "@/types/api";
import type { VehicleCategory } from "@/services/categories";
import { PostList } from "@/components/posts";
import { Sparkles } from "lucide-react";

const PAGE_SIZE = 12;

export default function PostsPage() {
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [data, setData] = useState<{
    items: PostListItemDto[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Fetch categories once
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const fetchPosts = useCallback(
    async (pageNum: number, catId: number | null) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getPublicPosts({
          page: pageNum,
          pageSize: PAGE_SIZE,
          categoryId: catId,
        });
        setData({
          items: result.items,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        });
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Không tải được danh sách xe",
        );
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchPosts(page, categoryId);
  }, [page, categoryId, fetchPosts]);

  const handleCategoryChange = (id: number | null) => {
    setCategoryId(id);
    setPage(1);
  };

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.currentPage ?? 1;
  const totalCount = data?.totalCount ?? 0;
  const normalizedKeyword = searchKeyword.trim().toLowerCase();
  const isSearching = normalizedKeyword.length > 0;

  const filteredItems = useMemo(() => {
    if (!isSearching) return items;

    return items.filter((post) => {
      const title = post.title?.toLowerCase() ?? "";
      const categoryName = post.categoryName?.toLowerCase() ?? "";
      return (
        title.includes(normalizedKeyword) ||
        categoryName.includes(normalizedKeyword)
      );
    });
  }, [items, isSearching, normalizedKeyword]);

  const displayTotalCount = isSearching ? filteredItems.length : totalCount;
  const displayTotalPages = isSearching ? 1 : totalPages;
  const displayCurrentPage = isSearching ? 1 : currentPage;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">
            EcoRent
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl">
            Xe cho thuê
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Khám phá xe điện phù hợp cho chuyến đi của bạn
          </p>
        </div>

        {/* ── AI search ───────────────────────────────────────── */}
        <div className="mt-6 max-w-xl">
          <div className="relative">
            <Sparkles className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-blue-500" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm kiếm xe bằng AI: tên xe hoặc danh mục..."
              className="h-11 w-full rounded-xl border border-blue-100 bg-white pr-4 pl-10 text-sm text-gray-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* ── Category filter tabs ────────────────────────────── */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              categoryId === null
                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                categoryId === cat.id
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ── Error state ─────────────────────────────────────── */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            ⚠️ {error}
          </div>
        )}

        {/* ── Grid ────────────────────────────────────────────── */}
        {!error && (
          <PostList
            items={filteredItems}
            loading={loading}
            totalCount={displayTotalCount}
            totalPages={displayTotalPages}
            currentPage={displayCurrentPage}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
