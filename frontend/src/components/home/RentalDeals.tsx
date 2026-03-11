"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PostCard, PostCardSkeleton } from "@/components/posts";
import { getPublicPosts } from "@/services/posts";
import type { PostListItemDto } from "@/types/api";

const RentalDeals = () => {
  const [posts, setPosts] = useState<PostListItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicPosts({ page: 1, pageSize: 4 })
      .then((res) => setPosts(res.items.slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-6">
        {/* Section header — reference-style: eyebrow + bold title inline */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#1572D3]">
              Xe điện nổi bật
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">
              Xe điện được quan tâm nhiều nhất
            </h2>
          </div>
          <Link
            href="/posts"
            className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#1572D3] transition-colors hover:text-[#1260B0]"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Car grid — 4-column */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))
            : posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>

        {/* Bottom note */}
        <p className="mt-8 text-center text-sm text-slate-400">
          Hơn 500 xe điện từ khắp Việt Nam đang chờ bạn khám phá
        </p>
      </div>
    </section>
  );
};

export default RentalDeals;
