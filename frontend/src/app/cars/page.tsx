"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Car } from "lucide-react";
import { CarPostCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCars, CARS_PAGE_SIZE } from "@/services";
import type { PostListItemDto } from "@/types/api";

const PAGE_SIZE = CARS_PAGE_SIZE;

const LOCATION_OPTIONS = [
  { value: "all", label: "Tất cả địa điểm" },
  { value: "hcm", label: "Hồ Chí Minh" },
  { value: "hanoi", label: "Hà Nội" },
  { value: "danang", label: "Đà Nẵng" },
];

const BRAND_OPTIONS = [
  { value: "all", label: "Tất cả hãng" },
  { value: "vinfast", label: "VinFast" },
  { value: "tesla", label: "Tesla" },
  { value: "hyundai", label: "Hyundai" },
  { value: "kia", label: "Kia" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "Tất cả loại" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "hatchback", label: "Hatchback" },
];

export default function CarsPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{
    items: PostListItemDto[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(50);
  const [location, setLocation] = useState("all");
  const [brand, setBrand] = useState("all");
  const [type, setType] = useState("all");

  const fetchCars = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCars({ page: pageNum, pageSize: PAGE_SIZE });
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
    fetchCars(page);
  }, [page, fetchCars]);

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

        {/* Horizontal filter bar */}
        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <span className="text-sm font-medium text-slate-500">Bộ lọc:</span>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-medium text-slate-500">Giá (triệu/ngày)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={priceMax}
                value={priceMin}
                onChange={(e) => setPriceMin(Number(e.target.value) || 0)}
                className="w-14 rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                aria-label="Giá tối thiểu"
              />
              <span className="text-slate-400">–</span>
              <input
                type="number"
                min={priceMin}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value) || 50)}
                className="w-14 rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                aria-label="Giá tối đa"
              />
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="h-2 w-24 cursor-pointer appearance-none rounded-full bg-slate-200 accent-primary"
              aria-label="Thanh trượt giá tối đa"
            />
          </div>

          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-[160px]" size="sm">
              <SelectValue placeholder="Địa điểm" />
            </SelectTrigger>
            <SelectContent>
              {LOCATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger className="w-[140px]" size="sm">
              <SelectValue placeholder="Hãng xe" />
            </SelectTrigger>
            <SelectContent>
              {BRAND_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[140px]" size="sm">
              <SelectValue placeholder="Loại xe" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            {error}. Bạn có thể xem trang với dữ liệu mẫu.
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
            <p className="mt-6 text-sm text-slate-500">
              Hiển thị {startItem}–{endItem} trong tổng {totalCount} bài đăng
            </p>

            {items.length > 0 ? (
              <>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((post) => (
                    <CarPostCard key={post.id} post={post} />
                  ))}
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
                            totalPages - windowSize + 1
                          )
                        );
                        const end = Math.min(start + windowSize - 1, totalPages);
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
              <div className="mt-12 flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-sm">
                <Car className="h-14 w-14 text-slate-300" />
                <h3 className="mt-4 text-xl font-semibold text-slate-700">
                  Chưa có bài đăng
                </h3>
                <p className="mt-2 text-slate-500">
                  Thử đổi bộ lọc hoặc quay lại sau
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setPage(1)}
                >
                  Về trang 1
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
