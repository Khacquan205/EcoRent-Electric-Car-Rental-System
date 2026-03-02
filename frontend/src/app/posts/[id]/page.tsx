"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPostDetail } from "@/services/posts";
import type { PostDetailDto } from "@/types/api";
import { PostDetail } from "@/components/posts";
import { notFound } from "next/navigation";

/* ── Skeleton for the detail page ── */
function PostDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-pulse">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Back link placeholder */}
        <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-800" />

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Gallery skeleton */}
          <div className="space-y-4 lg:col-span-2">
            <div className="aspect-[16/9] w-full rounded-2xl bg-gray-200 dark:bg-gray-800" />
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
              <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mt-3 space-y-2">
                <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-4/6 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>

          {/* Info card skeleton */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900 space-y-4">
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="h-7 w-full rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-9 w-36 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                ))}
              </div>
              <div className="h-12 w-full rounded-xl bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Error / Not Found state ── */
function PostDetailError({ message }: { message: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
        <span className="text-4xl">🚫</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        Không tìm thấy bài đăng
      </h2>
      <p className="text-gray-500 dark:text-gray-400">
        {message ?? "Bài đăng không tồn tại hoặc đã bị xóa."}
      </p>
      <Link
        href="/posts"
        className="inline-flex items-center gap-2 rounded-xl bg-[#1572D3] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </Link>
    </div>
  );
}

/* ── Page ── */
export default function PostDetailPage() {
  const params = useParams();
  const id = Number(params?.id);

  const [post, setPost] = useState<PostDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || isNaN(id)) {
      notFound();
      return;
    }
    getPostDetail(id)
      .then((data) => {
        // Cast from legacy PostDetail to PostDetailDto (shapes are identical)
        setPost(data as unknown as PostDetailDto);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Không tải được bài đăng");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PostDetailSkeleton />;
  if (error || !post) return <PostDetailError message={error ?? ""} />;

  return <PostDetail post={post} />;
}
